import { Suspense, useEffect, useLayoutEffect, useReducer, useRef, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Environment, Sphere, Stats } from "@react-three/drei"
import * as THREE from "three"
import { HallwayProvider, IOSProvider } from "@/context/Facetracking"
import { ReadyPlayerMeAvatar } from "@/components/dashboard/ReadyPlayerMeAvatar"
import { Webcam } from "@/components/dashboard/Webcam"
import { FaceMesh } from "@/components/dashboard/FaceMesh"
import { useControls, button, Leva } from "leva"
import style from "./style.module.css"
import { AvatarPicker } from "@/components/dashboard/AvatarPicker"

export function DashboardPage() {
  const [avatar, setAvatar] = useState(null)
  return avatar ? (
    <DashboardPanels avatar={avatar} onOpenPicker={() => setAvatar(null)} />
  ) : (
    <AvatarPicker onInput={(value) => setAvatar(value)} />
  )
}

function DashboardPanels({ avatar = "custom", onOpenPicker = () => {} }) {
  const avatarURL = `/avatars/${avatar}.glb`

  const [calibrationKey, calibrate] = useReducer((x) => x + 1, 0)
  const iosBlendShapes = useRef()
  const hallwayBlendShapes = useRef()

  const [captures, setCaptures] = useState({})

  const exportData = () => {
    const data = {
      captures,
    }
    const blob = new Blob([JSON.stringify(data)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `export_${Date.now()}`
    a.click()
    console.log(data)
  }

  const capture = (get) => {
    const key = get("capture.expression")
    const value = {
      timestamp: Date.now(),
      avatar,
      iosBlendShapes: iosBlendShapes.current,
      hallwayBlendShapes: hallwayBlendShapes.current,
    }
    setCaptures((captures) => ({ ...captures, [key]: value }))
  }

  useControls("setup", {
    calibrate: button(calibrate),
    "choose avatar": button(onOpenPicker),
  })

  const expressionOptions = ["A", "B", "C", "D", "E", "F", "G"]

  useControls("capture", {
    expression: { options: expressionOptions },
    capture: button(capture),
  })

  const captured = Object.keys(captures).sort()
  const remaining = expressionOptions.filter((item) => !captured.includes(item))

  const capturedString = captured.join(", ")
  const remainingString = remaining.join(", ")
  const [_, set] = useControls(
    "export",
    () => ({
      captured: { value: capturedString, editable: false },
      remaining: { value: remainingString, editable: false },
      export: button(exportData),
    }),
    [exportData]
  )
  useEffect(() => {
    set({ captured: capturedString, remaining: remainingString })
  }, [capturedString, remainingString])

  const initCanvas = ({ gl }) => {
    gl.setScissorTest(true)
  }
  return (
    <>
      <div
        style={{
          position: "absolute",
          zIndex: 2,
          display: "grid",
          placeContent: "start center",
          width: "100%",
          height: "100%",
          overflow: "hidden",
        }}
      >
        <Leva fill collapsed hideCopyButton titleBar={{ filter: false, title: "Controls" }} />
      </div>
      <Webcam
        style={{
          position: "absolute",
          zIndex: 1,
          width: "50vw",
          height: "50vh",
          objectFit: "cover",
          transform: "scaleX(-1)",
        }}
      />
      <div className={style.centered}>
        <div className={style.labels}>
          <span className={style.label}>Webcam</span>
          <span className={style.label}>Avatar (Webcam)</span>
          <span className={style.label}>Mesh (iOS)</span>
          <span className={style.label}>Avatar (iOS)</span>
        </div>
      </div>
      <Canvas camera={{ manual: true }} onCreated={initCanvas}>
        <Stats />
        <Suspense fallback={null}>
          <Environment preset="warehouse" background />

          <IOSProvider blendShapesRef={iosBlendShapes} calibrationKey={calibrationKey}>
            {/* BOTTOM LEFT */}
            <group>
              <PerspectiveCameraView bounds={{ min: [0, 0], max: [0.5, 0.5] }} position={[0, 0, 5]} />
              <Backdrop />
              <group scale={14}>
                <group scale-x={-1}>
                  <FaceMesh />
                </group>
              </group>
            </group>

            {/* BOTTOM RIGHT */}
            <group position={[100, 0, 0]}>
              <Backdrop />
              <PerspectiveCameraView bounds={{ min: [0.5, 0], max: [1, 0.5] }} position={[0, 0, 5]} />
              <group scale={10}>
                <group position={[0, -0.64, 0]} scale-x={-1}>
                  <ReadyPlayerMeAvatar path={avatarURL} />
                </group>
              </group>
            </group>
          </IOSProvider>

          <HallwayProvider blendShapesRef={hallwayBlendShapes} calibrationKey={calibrationKey}>
            {/* TOP RIGHT */}
            <group position={[200, 0, 0]}>
              <Backdrop />
              <PerspectiveCameraView bounds={{ min: [0.5, 0.5], max: [1, 1] }} position={[0, 0, 5]} />
              <group scale={10}>
                <group position={[0, -0.64, 0]} scale-x={-1}>
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

function Backdrop() {
  return (
    <Sphere scale={7}>
      <meshStandardMaterial color="black" side={THREE.BackSide} />
    </Sphere>
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
