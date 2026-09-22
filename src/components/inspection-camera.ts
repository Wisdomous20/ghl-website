import * as THREE from "three";

/** Fit the part to the right of the explanation, accounting for its depth. */
export function inspectionCameraView(bounds: THREE.Box3, orientation: THREE.Quaternion, aspect: number, fov: number, points?: readonly THREE.Vector3[], angle = 0, portrait = aspect < 1) {
  const center = bounds.getCenter(new THREE.Vector3());
  const orbit = orientation.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle));
  const direction = new THREE.Vector3(0, 0, 1).applyQuaternion(orbit);
  const right = new THREE.Vector3(1, 0, 0).applyQuaternion(orbit);
  const up = new THREE.Vector3(0, 1, 0).applyQuaternion(orbit);
  const tangent = Math.tan(THREE.MathUtils.degToRad(fov / 2));
  const samples = points ?? [bounds.min.x, bounds.max.x].flatMap(x => [bounds.min.y, bounds.max.y].flatMap(y => [bounds.min.z, bounds.max.z].map(z => new THREE.Vector3(x, y, z))));
  const horizontal = tangent * aspect;
  if (portrait) {
    const frame = { left: -.86, right: .86, bottom: .12, top: .70 };
    const view = frameCamera(samples, center, orbit, aspect, fov, frame);
    if (angle !== 0) {
      const front = frameCamera(samples, center, orientation, aspect, fov, frame);
      const frontDistance = front.position.distanceTo(front.target);
      const distance = view.position.distanceTo(view.target);
      if (distance < frontDistance) {
        view.target.addScaledVector(view.up, -(frontDistance - distance) * tangent * .41);
        view.position.copy(view.target).addScaledVector(direction, frontDistance);
      }
    }
    return view;
  }
  let distance = .5;
  // Solve the perspective bounds per corner instead of over-padding a rotated world box.
  for (const point of samples) {
    const offset = point.clone().sub(center);
    const x = offset.dot(right), y = offset.dot(up), z = offset.dot(direction);
    distance = Math.max(distance, z + .3,
      (x + .94 * horizontal * z) / (horizontal * (.94 - .38)),
      (.13 * horizontal * z - x) / (horizontal * (.38 + .13)),
      Math.abs(y) / (tangent * .60) + z);
  }
  // Keep a thin component from growing as it turns edge-on.
  if (angle !== 0) {
    const front = inspectionCameraView(bounds, orientation, aspect, fov, samples, 0, false);
    distance = Math.max(distance, front.position.distanceTo(front.target));
  }
  const target = center.clone().addScaledVector(right, -distance * tangent * aspect * .38);
  const position = target.clone().addScaledVector(direction, distance);
  return { target, position, up };
}

export type CameraFrame = { left: number; right: number; bottom: number; top: number };

/** Fit actual corners inside an NDC rectangle, leaving room for the surrounding UI. */
export function frameCamera(points: readonly THREE.Vector3[], center: THREE.Vector3, orientation: THREE.Quaternion, aspect: number, fov: number, frame: CameraFrame) {
  const direction = new THREE.Vector3(0, 0, 1).applyQuaternion(orientation);
  const right = new THREE.Vector3(1, 0, 0).applyQuaternion(orientation);
  const up = new THREE.Vector3(0, 1, 0).applyQuaternion(orientation);
  const vertical = Math.tan(THREE.MathUtils.degToRad(fov / 2));
  const horizontal = vertical * aspect;
  const cx = (frame.left + frame.right) / 2, cy = (frame.bottom + frame.top) / 2;
  let distance = .5;
  for (const point of points) {
    const offset = point.clone().sub(center);
    const x = offset.dot(right), y = offset.dot(up), z = offset.dot(direction);
    distance = Math.max(distance, z + .3,
      (x + frame.right * horizontal * z) / (horizontal * (frame.right - cx)),
      (-frame.left * horizontal * z - x) / (horizontal * (cx - frame.left)),
      (y + frame.top * vertical * z) / (vertical * (frame.top - cy)),
      (-frame.bottom * vertical * z - y) / (vertical * (cy - frame.bottom)));
  }
  const target = center.clone().addScaledVector(right, -distance * horizontal * cx).addScaledVector(up, -distance * vertical * cy);
  return { target, position: target.clone().addScaledVector(direction, distance), up };
}
