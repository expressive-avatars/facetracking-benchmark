import * as THREE from "three"

import { useRef, useState } from "react"
import { useFaceMesh } from "@/context/Facetracking"
import { dampQuaternions } from "@/utils/dampQuaternions"
import { useFrame } from "@react-three/fiber"

const LAMBDA = 50

export function FaceMesh() {
  /** @type {React.RefObject<THREE.Mesh>} */
  const mesh = useRef()

  const [target] = useState(() => ({
    headQuaternion: new THREE.Quaternion(),
  }))

  useFrame((_, dt) => {
    dampQuaternions(mesh.current.quaternion, target.headQuaternion, LAMBDA, dt)
  })

  useFaceMesh(({ headQuaternion, vertexPositions, triangleIndices }) => {
    target.headQuaternion.copy(headQuaternion)

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
