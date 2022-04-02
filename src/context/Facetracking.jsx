import { createContext, useContext, useState, useEffect } from "react"
import io from "socket.io-client"

const FacetrackingContext = createContext()

/**
 *
 * @param {(args: {blendShapes: {[key: string]: number}, headRotation: number[], eyeRotation: number[]}) => void} fn
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
    console.log("adding useFaceMesh listener")
    faceMeshListeners.add(fn)
    return () => faceMeshListeners.delete(fn)
  }, [fn, faceMeshListeners])
}

let flag = false

export function IOSProvider({ children }) {
  const [socket] = useState(() => io("/dashboard"))
  const [[blendShapeListeners, faceMeshListeners]] = useState(() => [new Set(), new Set()])
  useEffect(() => {
    socket.on("iosResults", ({ blendShapes, headRotation, eyeRotation, vertexPositions, triangleIndices }) => {
      blendShapeListeners.forEach((fn) => fn({ blendShapes, headRotation, eyeRotation }))
      faceMeshListeners.forEach((fn) =>
        fn({
          vertexPositions: new Float32Array(vertexPositions),
          triangleIndices: new Uint32Array(triangleIndices),
          headRotation,
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

export function HallwayProvider({ children }) {
  const [bc] = useState(() => new BroadcastChannel("hallway"))
  const [blendShapeListeners] = useState(() => new Set())
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

          const headRotation = [-rotation.pitch, rotation.yaw, -rotation.roll]

          const eyeRotationX = blendShapes["eyeLookDownRight"] * 0.5 - blendShapes["eyeLookUpRight"] * 0.5
          const eyeRotationZ = blendShapes["eyeLookOutRight"] - blendShapes["eyeLookOutLeft"]
          const eyeRotation = [eyeRotationX, 0, eyeRotationZ]

          blendShapeListeners.forEach((fn) => fn({ blendShapes, headRotation, eyeRotation }))
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
