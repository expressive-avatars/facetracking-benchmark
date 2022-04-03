import React, { createContext, useContext, useState, useEffect, useRef } from "react"
import io from "socket.io-client"
import * as THREE from "three"

const headQuaternion = new THREE.Quaternion()
const headEuler = new THREE.Euler()

/** @type {React.Context<{ blendShapeListeners?: Set<function>, faceMeshListeners?: Set<function}>} */
const FacetrackingContext = createContext()

/**
 *
 * @param {(args: {blendShapes: {[key: string]: number}, headQuaternion: THREE.Quaternion, eyeRotation: number[]}) => void} fn
 */
export const useBlendShapes = (fn) => {
  const { blendShapeListeners } = useContext(FacetrackingContext)
  useEffect(() => {
    if (!blendShapeListeners) throw new Error("Context does not support blendShapeListeners")
    blendShapeListeners.add(fn)
    return () => blendShapeListeners.delete(fn)
  }, [fn, blendShapeListeners])
}

/**
 *
 * @param {(args: {vertexPositions: ArrayBuffer, triangleIndices: ArrayBuffer, headRotation: number[] }) => void} fn
 */
export const useFaceMesh = (fn) => {
  const { faceMeshListeners } = useContext(FacetrackingContext)
  useEffect(() => {
    if (!faceMeshListeners) throw new Error("Context does not support faceMeshListeners")
    faceMeshListeners.add(fn)
    return () => faceMeshListeners.delete(fn)
  }, [fn, faceMeshListeners])
}

export function IOSProvider({ calibrationKey, blendShapesRef, children }) {
  const [socket] = useState(() => io("/dashboard"))
  const [[blendShapeListeners, faceMeshListeners]] = useState(() => [new Set(), new Set()])

  /**
   * Calibration resources
   */
  const [calibrationQuaternion] = useState(() => new THREE.Quaternion())
  const needsCalibration = useRef(false)
  useEffect(() => {
    needsCalibration.current = true
  }, [calibrationKey])

  useEffect(() => {
    socket.on("iosResults", ({ blendShapes, headRotation, eyeRotation, vertexPositions, triangleIndices }) => {
      if (blendShapesRef) {
        blendShapesRef.current = blendShapes
      }

      // Calibration
      headEuler.fromArray(headRotation)
      headQuaternion.setFromEuler(headEuler)
      if (needsCalibration.current) {
        calibrationQuaternion.copy(headQuaternion).invert()
        needsCalibration.current = false
      }
      headQuaternion.premultiply(calibrationQuaternion)

      blendShapeListeners.forEach((fn) => fn({ blendShapes, headQuaternion, eyeRotation }))
      faceMeshListeners.forEach((fn) =>
        fn({
          vertexPositions: new Float32Array(vertexPositions),
          triangleIndices: new Uint32Array(triangleIndices),
          headQuaternion,
        })
      )
    })
  }, [socket, blendShapeListeners, faceMeshListeners])
  return (
    <FacetrackingContext.Provider value={{ blendShapeListeners, faceMeshListeners }}>
      {children}
    </FacetrackingContext.Provider>
  )
}

export function HallwayProvider({ calibrationKey, blendShapesRef, children }) {
  const [bc] = useState(() => new BroadcastChannel("hallway"))
  const [blendShapeListeners] = useState(() => new Set())

  /**
   * Calibration resources
   */
  const [calibrationQuaternion] = useState(() => new THREE.Quaternion())
  const needsCalibration = useRef(false)
  useEffect(() => {
    needsCalibration.current = true
  }, [calibrationKey])

  useEffect(() => {
    const onMessage = (e) => {
      const action = e.data
      switch (action.type) {
        case "log":
          const message = action.payload
          console.log(message)
          break
        case "results":
          /** @type {import("@quarkworks-inc/avatar-webkit").AvatarPrediction} */
          const results = action.payload
          const { rotation, actionUnits: blendShapes } = results
          if (blendShapesRef) {
            blendShapesRef.current = blendShapes
          }

          headEuler.set(-rotation.pitch, rotation.yaw, -rotation.roll)
          headQuaternion.setFromEuler(headEuler)

          if (needsCalibration.current) {
            calibrationQuaternion.copy(headQuaternion).invert()
            needsCalibration.current = false
          }
          headQuaternion.premultiply(calibrationQuaternion)

          const eyeRotationX = blendShapes["eyeLookDownRight"] * 0.5 - blendShapes["eyeLookUpRight"] * 0.5
          const eyeRotationZ = blendShapes["eyeLookOutRight"] - blendShapes["eyeLookOutLeft"]
          const eyeRotation = [eyeRotationX, 0, eyeRotationZ]

          blendShapeListeners.forEach((fn) => fn({ blendShapes, headQuaternion, eyeRotation }))
          break
      }
    }
    bc.addEventListener("message", onMessage)
    return () => bc.removeEventListener("message", onMessage)
  }, [bc, blendShapeListeners])
  useEffect(() => {
    return () => bc.close()
  }, [])
  return <FacetrackingContext.Provider value={{ blendShapeListeners }}>{children}</FacetrackingContext.Provider>
}
