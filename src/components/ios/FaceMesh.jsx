import * as THREE from "three"

import { useRef } from "react"
import { useFacetracking } from "./FacetrackingManager"

export function FaceMesh() {
  const mesh = useRef()

  /** @type {React.RefObject<THREE.BufferGeometry>} */
  const geometry = useRef()
  useFacetracking(({ headOrientation, vertexPositions, triangleIndices }) => {
    mesh.current.quaternion.copy(headOrientation)

    let position = geometry.current.attributes.position
    let index = geometry.current.index

    if (position && index) {
      position.copyArray(vertexPositions)
      index.copyArray(triangleIndices)
      position.needsUpdate = index.needsUpdate = true
      geometry.current.computeVertexNormals()
    } else {
      position = new THREE.BufferAttribute(vertexPositions, 3)
      index = new THREE.BufferAttribute(triangleIndices, 1)
      position.usage = index.usage = THREE.DynamicDrawUsage
      geometry.current.setAttribute("position", position)
      geometry.current.setIndex(index)
      geometry.current.computeVertexNormals()
    }
  })
  return (
    <mesh ref={mesh} frustumCulled={false}>
      <meshStandardMaterial color="white" metalness={1} roughness={0.2} side={THREE.DoubleSide} />
      <bufferGeometry ref={geometry} />
    </mesh>
  )
}
