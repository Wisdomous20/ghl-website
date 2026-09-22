import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { inspectionCameraView, frameCamera } from "../src/components/inspection-camera.ts";

test("large and small component close-ups fit beside the explanation on desktop", () => {
  for (const aspect of [1280 / 720, 1646 / 888, 2560 / 1440]) {
    for (const size of [[6.7, .3, 4.35], [5.9, 1.5, 2.5], [1.1, .1, 1.1], [1.76, .1, 1.3]]) {
      const bounds = new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(2, 1, -.4), new THREE.Vector3(...size));
      for (const rotation of [-.7, 0, .72]) {
        const orientation = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rotation, -.13));
        const view = inspectionCameraView(bounds, orientation, aspect, 34);
        const camera = new THREE.PerspectiveCamera(34, aspect, .1, 100);
        camera.position.copy(view.position); camera.up.copy(view.up); camera.lookAt(view.target); camera.updateMatrixWorld(true);
        for (const x of [bounds.min.x, bounds.max.x]) for (const y of [bounds.min.y, bounds.max.y]) for (const z of [bounds.min.z, bounds.max.z]) {
          const point = new THREE.Vector3(x, y, z).project(camera);
          const screenX = (point.x + 1) / 2, screenY = (1 - point.y) / 2;
          assert.ok(screenX > .40 && screenX < .98, `part must leave copy clear, x=${screenX}`);
          assert.ok(screenY > .12 && screenY < .88, `part must fit vertically, y=${screenY}`);
          assert.ok(point.z > -1 && point.z < 1);
        }
      }
    }
  }
});

test("inspection starts square to the component face, independent of the assembly pose", () => {
  const orientation = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, .65, -.2));
  const bounds = new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(), new THREE.Vector3(6, .2, 3));
  const front = inspectionCameraView(bounds, orientation, 16 / 9, 34);
  const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(orientation);
  assert.ok(front.position.clone().sub(front.target).normalize().distanceTo(normal) < 1e-10);
  assert.ok(front.up.distanceTo(new THREE.Vector3(0, 1, 0).applyQuaternion(orientation)) < 1e-10);
});

test("a full inspection turn stays inside the detail area and does not zoom into an edge", () => {
  const orientation = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));
  const bounds = new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(), new THREE.Vector3(6, .2, 3));
  const front = inspectionCameraView(bounds, orientation, 16 / 9, 34);
  for (let step = -12; step <= 12; step++) {
    const view = inspectionCameraView(bounds, orientation, 16 / 9, 34, undefined, step * Math.PI / 6);
    assert.ok(view.position.distanceTo(view.target) >= front.position.distanceTo(front.target) - 1e-10);
    const camera = new THREE.PerspectiveCamera(34, 16 / 9, .1, 100);
    camera.position.copy(view.position); camera.up.copy(view.up); camera.lookAt(view.target); camera.updateMatrixWorld(true);
    for (const x of [-3, 3]) for (const y of [-.1, .1]) for (const z of [-1.5, 1.5]) {
      const point = new THREE.Vector3(x, y, z).project(camera);
      assert.ok(point.x >= -.131 && point.x <= .941);
      assert.ok(Math.abs(point.y) <= .601);
    }
  }
});

test("portrait close-ups stay above the detail sheet throughout a full rotation", () => {
  for (const aspect of [320 / 568, 390 / 844, 768 / 1024]) {
    for (const size of [[6.7, .3, 4.35], [1.1, .1, 1.1]]) {
      const bounds = new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(2, 1, -.4), new THREE.Vector3(...size));
      const orientation = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, .4, -.1));
      for (let step = 0; step <= 12; step++) {
        const view = inspectionCameraView(bounds, orientation, aspect, 34, undefined, step * Math.PI / 6, true);
        const camera = new THREE.PerspectiveCamera(34, aspect, .1, 180);
        camera.position.copy(view.position); camera.up.copy(view.up); camera.lookAt(view.target); camera.updateMatrixWorld(true);
        for (const x of [bounds.min.x, bounds.max.x]) for (const y of [bounds.min.y, bounds.max.y]) for (const z of [bounds.min.z, bounds.max.z]) {
          const point = new THREE.Vector3(x, y, z).project(camera);
          assert.ok(point.x >= -.861 && point.x <= .861, `part remains inside phone width: ${point.x}`);
          assert.ok(point.y >= .119 && point.y <= .701, `part remains above detail sheet: ${point.y}`);
          assert.ok(point.z > -1 && point.z < 1);
        }
      }
    }
  }
});

test("assembly framing reserves the narrative and chapter controls on a phone", () => {
  const points = [-4, 4].flatMap(x => [-1, 5].flatMap(y => [-2.5, 2.5].map(z => new THREE.Vector3(x, y, z))));
  const orientation = new THREE.Quaternion().setFromEuler(new THREE.Euler(-.4, .6, -.1));
  const aspect = 390 / 844;
  const frame = { left: -.94, right: .94, top: .16, bottom: -.42 };
  const view = frameCamera(points, new THREE.Vector3(0, 2, 0), orientation, aspect, 34, frame);
  const camera = new THREE.PerspectiveCamera(34, aspect, .1, 180);
  camera.position.copy(view.position); camera.up.copy(view.up); camera.lookAt(view.target); camera.updateMatrixWorld(true);
  for (const corner of points) {
    const point = corner.clone().project(camera);
    assert.ok(point.x >= frame.left - 1e-8 && point.x <= frame.right + 1e-8);
    assert.ok(point.y >= frame.bottom - 1e-8 && point.y <= frame.top + 1e-8);
  }
});
