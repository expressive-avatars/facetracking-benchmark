import { Suspense, useLayoutEffect, useReducer, useRef, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Box, Environment, Stats } from "@react-three/drei"
import * as THREE from "three"
import { useSearchParams } from "@/hooks/useSearchParams"
import { HallwayProvider, IOSProvider } from "@/context/Facetracking"
import { ReadyPlayerMeAvatar } from "@/components/dashboard/ReadyPlayerMeAvatar"
import { Webcam } from "@/components/dashboard/Webcam"
import { FaceMesh } from "@/components/dashboard/FaceMesh"
import { useControls, button } from "leva"
import style from "./style.module.css"

const DEFAULT_AVATAR = "https://d1a370nemizbjq.cloudfront.net/b2572c50-a10a-42b6-ab30-694f60fed40f.glb"

export function DashboardPage() {
  const onCreated = ({ gl }) => {
    gl.setScissorTest(true)
  }
  const searchParams = useSearchParams()
  const avatarURL = searchParams.get("avatarURL") ?? DEFAULT_AVATAR

  const [calibrationKey, calibrate] = useReducer((x) => x + 1, 0)
  useControls({
    calibrate: button(() => {
      console.log("calibrate")
      calibrate()
    }),
  })
  return (
    <>
      <Webcam style={{ position: "absolute", zIndex: 1, width: "50vw", height: "50vh", objectFit: "cover" }} />
      <div className={style.centered}>
        <div className={style.labels}>
          <span className={style.label}>Webcam</span>
          <span className={style.label}>Avatar (Webcam)</span>
          <span className={style.label}>Mesh (iOS)</span>
          <span className={style.label}>Avatar (iOS)</span>
        </div>
      </div>
      <Canvas camera={{ manual: true }} onCreated={onCreated}>
        <Stats />
        <Suspense fallback={null}>
          <Environment preset="warehouse" background />

          <IOSProvider calibrationKey={calibrationKey}>
            {/* BOTTOM LEFT */}
            <group>
              <PerspectiveCameraView bounds={{ min: [0, 0], max: [0.5, 0.5] }} position={[0, 0, 5]} />
              <group scale={14}>
                <FaceMesh />
              </group>
            </group>

            {/* BOTTOM RIGHT */}
            <group position={[100, 0, 0]}>
              <PerspectiveCameraView bounds={{ min: [0.5, 0], max: [1, 0.5] }} position={[0, 0, 5]} />
              <group scale={10}>
                <group position={[0, -0.64, 0]}>
                  <ReadyPlayerMeAvatar path={avatarURL} />
                </group>
              </group>
            </group>
          </IOSProvider>

          <HallwayProvider calibrationKey={calibrationKey}>
            {/* TOP RIGHT */}
            <group position={[200, 0, 0]}>
              <PerspectiveCameraView bounds={{ min: [0.5, 0.5], max: [1, 1] }} position={[0, 0, 5]} />
              <group scale={10}>
                <group position={[0, -0.64, 0]}>
                  <ReadyPlayerMeAvatar path={avatarURL} />
                </group>
              </group>
            </group>
          </HallwayProvider>
        </Suspense>
      </Canvas>
    </>
  )
}

function Rotate(props) {
  const ref = useRef()
  useFrame((_, dt) => {
    ref.current.rotation.x = ref.current.rotation.y += dt
  })
  return <group ref={ref} {...props} />
}

function PerspectiveCameraView({ bounds, ...rest }) {
  const camera = useRef()
  useScissorView(camera, bounds)
  return <perspectiveCamera ref={camera} {...rest} />
}

/**
 * @param {React.RefObject<THREE.PerspectiveCamera>} camera
 * @param {{ min: number[], max: number[] }} bounds
 */
function useScissorView(camera, bounds) {
  const { size } = useThree()
  const [view] = useState(() => new THREE.Vector4())

  // Handle resize
  useLayoutEffect(() => {
    const x = bounds.min[0] * size.width
    const y = bounds.min[1] * size.height
    let width = (bounds.max[0] - bounds.min[0]) * size.width
    let height = (bounds.max[1] - bounds.min[1]) * size.height
    // Edge case (literally) for pixel rounding
    if (bounds.max[0] === 1) width = Math.ceil(width)
    if (bounds.max[1] === 1) height = Math.ceil(height)
    view.set(x, y, width, height)

    camera.current.aspect = width / height
    camera.current.updateProjectionMatrix()
  }, [size])

  useFrame(({ gl, scene }) => {
    gl.setViewport(view)
    gl.setScissor(view)
    gl.render(scene, camera.current)
  }, 10)
}
