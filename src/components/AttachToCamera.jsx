import { useThree, createPortal } from "@react-three/fiber"

export function AttachToCamera({ children }) {
  const { camera } = useThree()
  return createPortal(children, camera)
}
