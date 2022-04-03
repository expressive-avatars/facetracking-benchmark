import * as THREE from "three"

import { useRef, useState } from "react"
import { useFaceMesh } from "@/context/Facetracking"
import { dampQuaternions } from "@/utils/dampQuaternions"
import { useFrame } from "@react-three/fiber"
import { triangleIndices } from "@/utils/triangleIndices"

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

  useFaceMesh(({ headQuaternion, vertexPositions }) => {
    target.headQuaternion.copy(headQuaternion)

    const geometry = mesh.current.geometry

    let position = geometry.attributes.position

    Object.assign(window, { vertexPositions })

    if (position) {
      position.copyArray(vertexPositions)
      position.needsUpdate = true
      geometry.computeVertexNormals()
    } else {
      position = new THREE.BufferAttribute(vertexPositions, 3)
      position.usage = THREE.DynamicDrawUsage
      geometry.setAttribute("position", position)
      geometry.computeVertexNormals()
    }
  })
  const initGeometry = (geometry) => {
    const arr = new Uint32Array(triangleIndices)
    const index = new THREE.BufferAttribute(arr, 1)
    geometry.setIndex(index)
  }
  return (
    <mesh ref={mesh} frustumCulled={false}>
      <meshStandardMaterial color="white" metalness={1} roughness={0.2} side={THREE.DoubleSide} />
      <bufferGeometry onUpdate={initGeometry} />
    </mesh>
  )
}
