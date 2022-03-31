import * as THREE from "three"

const vPos = new THREE.Vector3()
const vMorph = new THREE.Vector3()

/**
 * Morphs a mesh's geometry on the CPU, to support additional
 * blend shapes in browsers that don't support WebGL 2.
 */
export class CPUMorpher {
  /**
   * @param {THREE.Mesh} mesh
   */
  constructor(mesh) {
    if (!mesh.isMesh) throw new Error("CPUMorpher requires a THREE.Mesh instance")
    this.mesh = mesh

    // If we haven't already done so...
    if (!mesh.geometry.getAttribute("_position")) {
      // Clone the original vertex positions so we don't overwrite them
      const _position = mesh.geometry.getAttribute("position").clone()
      mesh.geometry.setAttribute("_position", _position)
    }

    this.morphTargetInfluences = Array.from(mesh.morphTargetInfluences)
  }

  /**
   * @param {number[]} influences
   */
  _applyMorphTargetInfluences(influences) {
    const position = this.mesh.geometry.getAttribute("position")
    const basis = this.mesh.geometry.getAttribute("_position")
    // For each vertex index
    for (let iv = 0; iv < position.count; ++iv) {
      // Start from the original vertex position
      vPos.fromBufferAttribute(basis, iv)

      // For each morph index
      for (let im = 0; im < influences.length; ++im) {
        // NOTE: assuming relative morphs
        const morphPosition = this.mesh.geometry.morphAttributes.position[im]
        vMorph.fromBufferAttribute(morphPosition, iv)

        // Apply morph scaled by its influence
        vPos.addScaledVector(vMorph, influences[im])
      }
      position.setXYZ(iv, vPos.x, vPos.y, vPos.z)
    }
    position.needsUpdate = true
  }

  update() {
    this._applyMorphTargetInfluences(this.morphTargetInfluences)
  }
}
