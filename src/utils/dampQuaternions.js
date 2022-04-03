import * as THREE from "three"

export function dampQuaternions(qa, qb, lambda, dt) {
  qa.x = THREE.MathUtils.damp(qa.x, qb.x, lambda, dt)
  qa.y = THREE.MathUtils.damp(qa.y, qb.y, lambda, dt)
  qa.z = THREE.MathUtils.damp(qa.z, qb.z, lambda, dt)
  qa.w = THREE.MathUtils.damp(qa.w, qb.w, lambda, dt)
}
