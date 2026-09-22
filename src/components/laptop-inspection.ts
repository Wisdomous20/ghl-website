import * as THREE from "three";
import { isAssemblyPartId, type AssemblyPartId } from "./assembly-parts";
import { inspectionCameraView } from "./inspection-camera";

type Renderable = THREE.Mesh | THREE.LineSegments;

function visibleInTree(object: THREE.Object3D) {
  for (let node: THREE.Object3D | null = object; node; node = node.parent) if (!node.visible) return false;
  return true;
}

/** The nearest tagged ancestor owns a click, so a processor does not select its board. */
export function componentId(object: THREE.Object3D): AssemblyPartId | null {
  for (let node: THREE.Object3D | null = object; node; node = node.parent) {
    if (isAssemblyPartId(node.userData.inspectId)) return node.userData.inspectId;
  }
  return null;
}

/** Reuses the actual geometry in a second render pass; no duplicate model or WebGL context. */
export function createLaptopInspection(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera, laptop: THREE.Group) {
  const renderables: Renderable[] = [];
  laptop.traverse(object => { if (object instanceof THREE.Mesh || object instanceof THREE.LineSegments) renderables.push(object); });
  const owners = new Map(renderables.map(object => [object, componentId(object)]));
  const pickable = renderables.filter((object): object is THREE.Mesh => object instanceof THREE.Mesh && object.geometry.type !== "PlaneGeometry");
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const detailCamera = camera.clone();
  const washScene = new THREE.Scene();
  const washCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const washMaterial = new THREE.MeshBasicMaterial({ color: 0xded9d1, transparent: true, depthTest: false, depthWrite: false });
  const wash = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), washMaterial);
  washScene.add(wash);
  const bounds = new THREE.Box3();
  const meshBounds = new THREE.Box3();
  const look = new THREE.Vector3();
  let detailMeshes: THREE.Mesh[] = [];
  const faceOrientation = new THREE.Quaternion();
  const topFace = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);

  function available() {
    return [...new Set(pickable.filter(visibleInTree).map(object => owners.get(object)).filter((id): id is AssemblyPartId => Boolean(id)))];
  }

  function pick(clientX: number, clientY: number) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.set((clientX - rect.left) / rect.width * 2 - 1, 1 - (clientY - rect.top) / rect.height * 2);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(pickable.filter(visibleInTree), false)[0];
    return hit ? owners.get(hit.object as THREE.Mesh) ?? null : null;
  }

  function hitDetail(clientX: number, clientY: number) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.set((clientX - rect.left) / rect.width * 2 - 1, 1 - (clientY - rect.top) / rect.height * 2);
    raycaster.setFromCamera(pointer, detailCamera);
    return raycaster.intersectObjects(detailMeshes, false).length > 0;
  }

  function render(id: AssemblyPartId | null, amount: number, assemblyFocus: THREE.Vector3, angle = 0) {
    if (!id || amount < .001) { renderer.render(scene, camera); return; }
    const selected = renderables.filter(object => owners.get(object) === id && visibleInTree(object));
    if (!selected.length) { renderer.render(scene, camera); return; }
    bounds.makeEmpty();
    const corners: THREE.Vector3[] = [];
    selected.forEach(object => {
      if (!(object instanceof THREE.Mesh)) return;
      if (object instanceof THREE.InstancedMesh) {
        if (!object.boundingBox) object.computeBoundingBox();
        meshBounds.copy(object.boundingBox!);
      } else {
        if (!object.geometry.boundingBox) object.geometry.computeBoundingBox();
        meshBounds.copy(object.geometry.boundingBox!);
      }
      for (const x of [meshBounds.min.x, meshBounds.max.x]) for (const y of [meshBounds.min.y, meshBounds.max.y]) for (const z of [meshBounds.min.z, meshBounds.max.z]) {
        corners.push(new THREE.Vector3(x, y, z).applyMatrix4(object.matrixWorld));
      }
      bounds.union(meshBounds.applyMatrix4(object.matrixWorld));
    });
    if (bounds.isEmpty()) { renderer.render(scene, camera); return; }
    detailMeshes = selected.filter((object): object is THREE.Mesh => object instanceof THREE.Mesh);
    let owner: THREE.Object3D | null = detailMeshes[0];
    while (owner && owner.userData.inspectId !== id) owner = owner.parent;
    (owner ?? laptop).getWorldQuaternion(faceOrientation);
    if (id !== "display") faceOrientation.multiply(topFace);
    const { target, position, up } = inspectionCameraView(bounds, faceOrientation, camera.aspect, camera.fov, corners, angle, renderer.domElement.clientWidth < 950);
    detailCamera.copy(camera);
    detailCamera.position.lerpVectors(camera.position, position, amount);
    detailCamera.up.lerpVectors(camera.up, up, amount).normalize();
    look.lerpVectors(assemblyFocus, target, amount);
    detailCamera.lookAt(look); detailCamera.updateMatrixWorld(true);

    const visibility = renderables.map(object => object.visible);
    selected.forEach(object => { object.visible = false; });
    renderer.render(scene, camera);
    renderables.forEach((object, index) => { object.visible = visibility[index]; });
    renderer.autoClear = false;
    washMaterial.opacity = amount * .94;
    renderer.render(washScene, washCamera);
    renderer.clearDepth();
    const selectedSet = new Set(selected);
    renderables.forEach(object => { if (!selectedSet.has(object)) object.visible = false; });
    renderer.render(scene, detailCamera);
    renderables.forEach((object, index) => { object.visible = visibility[index]; });
    renderer.autoClear = true;
  }

  return { available, pick, hitDetail, render, dispose() { wash.geometry.dispose(); washMaterial.dispose(); } };
}
