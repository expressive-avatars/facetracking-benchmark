import { useThree } from "@react-three/fiber"
import { useLayoutEffect } from "react"
import * as THREE from "three"

export function Background({ color = "black" }) {
  const { set } = useThree()
  useLayoutEffect(() => {
    set(({ scene }) => void (scene.background = new THREE.Color(color)))
  }, [color])
  return null
}
