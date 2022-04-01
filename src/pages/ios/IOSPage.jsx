import { Suspense, useState } from "react"
import { Environment } from "@react-three/drei"
import { ARCanvas } from "@react-three/xr"

import { AttachToCamera } from "@/components/ios/AttachToCamera"
import { FacetrackingManager } from "@/components/ios/FacetrackingManager"
import { Background } from "@/components/shared/Background"
import { FaceMesh } from "@/components/ios/FaceMesh"
import { useAspect } from "@/hooks/ios/useAspect"
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
    <ARCanvas onCreated={onCreated} camera={{ near: 0 }}>
      <Suspense fallback={null}>
        <Scene />
        <Environment preset="apartment" />
      </Suspense>
      <Background color="black" />
      <FacetrackingManager />
    </ARCanvas>
  )
}

function Scene() {
  const aspect = useAspect()
  const landscape = aspect > 1
  return (
    <>
      <AttachToCamera>
        <group position-z={landscape ? -6 : -5} scale={10}>
          <group scale-x={-1}>
            <FaceMesh />
          </group>
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
