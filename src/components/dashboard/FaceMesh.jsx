import * as THREE from "three"

import { useRef } from "react"
import { useFaceMesh } from "@/context/Facetracking"

export function FaceMesh() {
  /** @type {React.RefObject<THREE.Mesh>} */
  const mesh = useRef()

  useFaceMesh(({ headQuaternion, vertexPositions, triangleIndices }) => {
    mesh.current.quaternion.copy(headQuaternion)

    const geometry = mesh.current.geometry

    let position = geometry.attributes.position
    let index = geometry.index

    if (position && index) {
      position.copyArray(vertexPositions)
      index.copyArray(triangleIndices)
      position.needsUpdate = index.needsUpdate = true
      geometry.computeVertexNormals()
    } else {
      position = new THREE.BufferAttribute(vertexPositions, 3)
      index = new THREE.BufferAttribute(triangleIndices, 1)
      position.usage = index.usage = THREE.DynamicDrawUsage
      geometry.setAttribute("position", position)
      geometry.setIndex(index)
      geometry.computeVertexNormals()
    }
  })
  return (
    <mesh ref={mesh} frustumCulled={false}>
      <meshStandardMaterial color="white" metalness={1} roughness={0.2} side={THREE.DoubleSide} />
      <bufferGeometry />
    </mesh>
  )
}
