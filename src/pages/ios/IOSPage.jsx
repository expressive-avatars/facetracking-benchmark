import { Suspense, useReducer, useRef, useState } from "react"
import { ARCanvas } from "@react-three/xr"
import { AttachToCamera } from "@/components/AttachToCamera"
import { ReadyPlayerMeAvatar } from "@/components/ReadyPlayerMeAvatar"

import { useAspect } from "@/hooks/useAspect"
import { Environment } from "@react-three/drei"
import { useFacetracking } from "@/hooks/useFacetracking"
import { ARManager } from "@/utils/ARManager"

export function IOSPage() {
  const [ar] = useState(() => new ARManager())

  /** @param {import('@react-three/fiber').RootState} state */
  const onCreated = (state) => {
    ar.renderer = state.gl
    ar.sessionInit.optionalFeatures = ["worldSensing"]
    ar.start()
  }

  return (
    <ARCanvas onCreated={onCreated}>
      <Suspense fallback={null}>
        <Scene />
        <Environment preset="apartment" background />
      </Suspense>
    </ARCanvas>
  )
}

function Scene() {
  const aspect = useAspect()
  const landscape = aspect > 1
  useFacetracking((blendShapes, headOrientation) => {
    ref.current.scale.setScalar(blendShapes["jawOpen"])
  })
  const ref = useRef()
  return (
    <>
      <AttachToCamera>
        <mesh ref={ref} position-z={landscape ? -6 : -5}>
          <meshNormalMaterial />
          <boxGeometry />
        </mesh>
        <group position-z={landscape ? -6 : -5} scale={10}>
          <group position={[0, -0.6, 0]} scale-x={-1}>
            {/* <ReadyPlayerMeAvatar
              path={"https://d1a370nemizbjq.cloudfront.net/b2572c50-a10a-42b6-ab30-694f60fed40f.glb"}
            /> */}
          </group>
        </group>
      </AttachToCamera>
    </>
  )
}
