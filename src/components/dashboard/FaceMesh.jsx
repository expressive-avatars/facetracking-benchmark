import * as THREE from "three"

import { useRef, useState } from "react"
import { useFaceMesh } from "@/context/Facetracking"
import { dampQuaternions } from "@/utils/dampQuaternions"
import { useFrame } from "@react-three/fiber"
import { triangleIndices } from "@/utils/triangleIndices"

const LAMBDA = 50

export function FaceMesh() {
  /** @type {React.RefObject<THREE.Geometry>} */
  const geometry = useRef()

  /** @type {React.RefObject<THREE.Group>} */
  const root = useRef()

  const [target] = useState(() => ({
    headQuaternion: new THREE.Quaternion(),
    vertexPositions: new Float32Array(3660),
  }))

  useFrame((_, dt) => {
    dampQuaternions(root.current.quaternion, target.headQuaternion, LAMBDA, dt)
    const position = geometry.current?.attributes.position
    if (position) {
      dampArrays(position.array, target.vertexPositions, LAMBDA, dt)
      position.needsUpdate = true
      geometry.current.computeVertexNormals()
    }
  })

  useFaceMesh(({ headQuaternion, vertexPositions }) => {
    target.headQuaternion.copy(headQuaternion)
    target.vertexPositions.set(vertexPositions)

    Object.assign(window, { vertexPositions })
  })
  const initGeometry = (geometry) => {
    const arr = new Uint32Array(triangleIndices)
    const index = new THREE.BufferAttribute(arr, 1)
    geometry.setIndex(index)

    const positionArr = new Float32Array(3660)
    const position = new THREE.BufferAttribute(positionArr, 3)
    position.usage = THREE.DynamicDrawUsage
    geometry.setAttribute("position", position)
    geometry.computeVertexNormals()
  }
  return (
    <group ref={root}>
      <mesh scale-x={-1} frustumCulled={false}>
        <meshStandardMaterial color="white" metalness={1} roughness={0.2} side={THREE.DoubleSide} />
        <bufferGeometry ref={geometry} onUpdate={initGeometry} />
      </mesh>
    </group>
  )
}

function dampArrays(a, b, lambda, dt) {
  for (let i = 0; i < a.length; ++i) {
    a[i] = THREE.MathUtils.damp(a[i], b[i], lambda, dt)
  }
}
