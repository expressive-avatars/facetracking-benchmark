import { useEffect, useState } from "react"
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
  const [headOrientation] = useState(() => new THREE.Quaternion())

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
          const { vertexPositions, triangleIndices } = worldMesh

          // Orient head using tracker result in local (physical) space
          localHeadMatrix.fromArray(worldMesh.modelMatrix)
          headOrientation.setFromRotationMatrix(localHeadMatrix)

          // Re-orient result to viewer's space
          const localToViewPose = frame.getPose(viewerReferenceSpace, localReferenceSpace)
          const q = localToViewPose.transform.orientation
          viewerOrientation.set(q.x, q.y, q.z, q.w)
          headOrientation.premultiply(viewerOrientation)

          // Un-mirror head orientation
          euler.setFromQuaternion(headOrientation)
          euler.y = -euler.y
          euler.z = -euler.z
          headOrientation.setFromEuler(euler)

          const payload = {
            blendShapes,
            headOrientation,
            vertexPositions,
            triangleIndices,
          }

          subscribers.forEach((callbackFn) => {
            callbackFn(payload)
          })

          socket.emit("results", payload)
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