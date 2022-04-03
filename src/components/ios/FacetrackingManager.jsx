import { useEffect, useRef, useState } from "react"
import { useXRFrame } from "@react-three/xr"
import * as THREE from "three"
import io from "socket.io-client"

import { useXRSession } from "@/hooks/ios/useXRSession"
import { useReferenceSpace } from "@/hooks/ios/useReferenceSpace"
import { remapBlendShapes } from "@/utils/blendShapes"

const localHeadMatrix = new THREE.Matrix4()
const viewerOrientation = new THREE.Quaternion()
const euler = new THREE.Euler()

const subscribers = new Set()

export function FacetrackingManager() {
  const [headQuaternion] = useState(() => new THREE.Quaternion())

  const [socket] = useState(() => io())

  useXRSession((session) => {
    if (session) {
      session.updateWorldSensingState({
        meshDetectionState: {
          enabled: true,
        },
      })
    }
  })

  const localReferenceSpace = useReferenceSpace("local")
  const viewerReferenceSpace = useReferenceSpace("viewer")

  const lastEmittedMs = useRef(0)
  const timeoutMs = 40

  useXRFrame((time, frame) => {
    const worldInfo = frame.worldInformation
    if (worldInfo.meshes && localReferenceSpace && viewerReferenceSpace) {
      worldInfo.meshes.forEach((worldMesh) => {
        if (
          worldMesh.changed &&
          worldMesh.blendShapes &&
          worldMesh.modelMatrix &&
          worldMesh.vertexPositions &&
          worldMesh.triangleIndices
        ) {
          const blendShapes = remapBlendShapes(worldMesh.blendShapes)

          /** @type {{ vertexPositions: Float32Array, triangleIndices: Uint32Array }} */
          const { vertexPositions, triangleIndices } = worldMesh

          // Orient head using tracker result in local (physical) space
          localHeadMatrix.fromArray(worldMesh.modelMatrix)
          headQuaternion.setFromRotationMatrix(localHeadMatrix)

          // Re-orient result to viewer's space
          const localToViewPose = frame.getPose(viewerReferenceSpace, localReferenceSpace)
          const q = localToViewPose.transform.orientation
          viewerOrientation.set(q.x, q.y, q.z, q.w)
          headQuaternion.premultiply(viewerOrientation)

          // Un-mirror head orientation
          euler.setFromQuaternion(headQuaternion)
          euler.y = -euler.y
          euler.z = -euler.z

          const headRotation = euler.toArray()
          const eyeRotationX = blendShapes["eyeLookDownRight"] * 0.5 - blendShapes["eyeLookUpRight"] * 0.5
          const eyeRotationZ = blendShapes["eyeLookOutRight"] - blendShapes["eyeLookOutLeft"]
          const eyeRotation = [eyeRotationX, 0, eyeRotationZ]

          subscribers.forEach((callbackFn) => {
            callbackFn({
              blendShapes,
              headRotation,
              eyeRotation,
              vertexPositions,
              triangleIndices,
            })
          })

          if (time - lastEmittedMs.current > timeoutMs) {
            lastEmittedMs.current = time
            socket.volatile.emit("results", {
              blendShapes,
              headRotation,
              eyeRotation,
              vertexPositions,
            })
          }
        }
      })
    }
  })

  return null
}

export function useFacetracking(fn) {
  useEffect(() => {
    subscribers.add(fn)
    return () => subscribers.delete(fn)
  }, [fn])
}
