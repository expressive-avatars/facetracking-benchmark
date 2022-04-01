import { useFrame } from "@react-three/fiber"
import { useState } from "react"

/**
 * iOS and/or WebXR seems to mess up reactive-ness of built-in
 * aspect value from useThree(), so we'll do it ourselves by
 * testing window size each frame.
 */
export function useAspect() {
  const [aspect, setAspect] = useState(window.innerWidth / window.innerHeight)
  useFrame(() => {
    const currAspect = window.innerWidth / window.innerHeight
    if (currAspect !== aspect) {
      setAspect(currAspect)
    }
  })
  return aspect
}
