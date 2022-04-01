import { useFacetracking } from "@/hooks/useFacetracking"
import { CPUMorpher } from "@/utils/CPUMorpher"
import { useGLTF } from "@react-three/drei"
import { useMemo } from "react"
import * as THREE from "three"

export function ReadyPlayerMeAvatar({ path }) {
  const { scene, nodes } = useGLTF(path)

  /**
   * @type {{
   * bones: {[boneName: string]: THREE.Bone},
   * meshes: THREE.Mesh[]
   * morphers: CPUMorpher[]
   * }}
   */
  const { bones, meshes, morphers } = useMemo(() => {
    const bones = {
      head: nodes.Head,
      eyeL: nodes.LeftEye,
      eyeR: nodes.RightEye,
    }

    const meshes = []
    scene.traverse((object) => {
      if (object.isMesh && object.morphTargetInfluences?.length > 0) {
        meshes.push(object)
      }
    })

    const morphers = meshes.map((mesh) => new CPUMorpher(mesh))

    return { bones, meshes, morphers }
  }, [path])

  useFacetracking((blendShapes, headOrientation) => {
    // Update bones
    bones.head.setRotationFromQuaternion(headOrientation)

    // Update morphs
    for (let morpher of morphers) {
      for (let blendShape in blendShapes) {
        const i = morpher.mesh.morphTargetDictionary[blendShape]
        morpher.morphTargetInfluences[i] = blendShapes[blendShape]
      }
      morpher.update()
    }
    try {
      // Eye rotation
      // Note: base eye rotation is (-Math.PI/2, 0, Math.PI)
      bones.eyeR.rotation.set(
        -Math.PI / 2 + blendShapes["eyeLookDownRight"] * 0.5 - blendShapes["eyeLookUpRight"] * 0.5,
        0,
        Math.PI - blendShapes["eyeLookOutRight"] + blendShapes["eyeLookOutLeft"]
      )
      bones.eyeL.rotation.copy(bones.eyeR.rotation)
    } catch (e) {
      // Prevent crashing if camera gets obscured
    }
  })

  return <primitive object={scene} />
}
