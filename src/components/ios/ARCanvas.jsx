import { XR } from "@react-three/xr"
import { Canvas } from "@react-three/fiber"

/**
 * Custom ARCanvas to support custom AR session handling
 *
 * @param {import('@react-three/xr').XRCanvasProps}
 */
export function ARCanvas({ onCreated, children, sessionInit, ...rest }) {
  return (
    <XRCanvas onCreated={onCreated} {...rest}>
      {children}
    </XRCanvas>
  )
}

/**
 * @param {import('@react-three/fiber').Props & { foveation?: number }}
 */
function XRCanvas({ foveation, children, ...rest }) {
  return (
    <Canvas vr {...rest}>
      <XR foveation={foveation}>{children}</XR>
    </Canvas>
  )
}
