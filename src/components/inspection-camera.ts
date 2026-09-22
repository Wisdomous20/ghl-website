import * as THREE from "three";

/** Fit the part to the right of the explanation, accounting for its depth. */
export function inspectionCameraView(bounds: THREE.Box3, orientation: THREE.Quaternion, aspect: number, fov: number, points?: readonly THREE.Vector3[], angle = 0) {
  const center = bounds.getCenter(new THREE.Vector3());
  const orbit = orientation.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle));
  const direction = new THREE.Vector3(0, 0, 1).applyQuaternion(orbit);
  const right = new THREE.Vector3(1, 0, 0).applyQuaternion(orbit);
  const up = new THREE.Vector3(0, 1, 0).applyQuaternion(orbit);
  const tangent = Math.tan(THREE.MathUtils.degToRad(fov / 2));
  const samples = points ?? [bounds.min.x, bounds.max.x].flatMap(x => [bounds.min.y, bounds.max.y].flatMap(y => [bounds.min.z, bounds.max.z].map(z => new THREE.Vector3(x, y, z))));
  const horizontal = tangent * aspect;
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
    const front = inspectionCameraView(bounds, orientation, aspect, fov, samples);
    distance = Math.max(distance, front.position.distanceTo(front.target));
  }
  const target = center.clone().addScaledVector(right, -distance * tangent * aspect * .38);
  const position = target.clone().addScaledVector(direction, distance);
  return { target, position, up };
}
