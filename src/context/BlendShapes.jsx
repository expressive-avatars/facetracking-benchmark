import { createContext, useContext, useState, useEffect } from "react"

const BlendShapesContext = createContext()

/**
 *
 * @param {(args: {blendShapes: {[key: string]: number}, headRotation: number[], eyeRotation: number[]}) => void} fn
 */
export const useBlendShapes = (fn) => {
  /** @type {{ listeners: Set }} */
  const { listeners } = useContext(BlendShapesContext)
  useEffect(() => {
    if (!listeners) throw new Error("no listeners provided in BlendShapesContext")
    listeners.add(fn)
    return () => listeners.delete(fn)
  }, [fn, listeners])
}

export function IOSBlendShapes({ children }) {
  const [socket] = useState(() => io())
  const [listeners] = useState(() => new Set())
  useEffect(() => {
    socket.on("blendShapes", ({ blendShapes, headRotation, eyeRotation }) => {
      listeners.forEach((fn) => fn({ blendShapes, headRotation, eyeRotation }))
    })
  }, [socket, listeners])
  return <BlendShapesContext.Provider value={{ listeners }}>{children}</BlendShapesContext.Provider>
}

export function HallwayBlendShapes({ children }) {
  const [bc] = useState(() => new BroadcastChannel("hallway"))
  const [listeners] = useState(() => new Set())
  useEffect(() => {
    const onMessage = (e) => {
      /** @type {import("@quarkworks-inc/avatar-webkit").AvatarPrediction} */
      const results = e.data
      const { rotation, actionUnits: blendShapes } = results

      const headRotation = [-rotation.pitch, rotation.yaw, -rotation.roll]

      const eyeRotationX = actionUnits["eyeLookDownRight"] * 0.5 - actionUnits["eyeLookUpRight"] * 0.5
      const eyeRotationZ = actionUnits["eyeLookOutRight"] - actionUnits["eyeLookOutLeft"]
      const eyeRotation = [eyeRotationX, 0, eyeRotationZ]

      listeners.forEach((fn) => fn({ blendShapes, headRotation, eyeRotation }))
    }
    bc.addEventListener("message", onMessage)
    return () => bc.removeEventListener("message", onMessage)
  }, [bc, listeners])
  return <BlendShapesContext.Provider value={{ listeners }}>{children}</BlendShapesContext.Provider>
}
