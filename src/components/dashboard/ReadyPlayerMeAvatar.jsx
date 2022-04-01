import { useBlendShapes } from "@/context/BlendShapes"
import { useGLTF } from "@react-three/drei"
import { useMemo } from "react"
import * as THREE from "three"

export function ReadyPlayerMeAvatar({ path }) {
  const { scene, nodes } = useGLTF(path)

  /**
   * @type {{
   * bones: {[boneName: string]: THREE.Bone},
   * meshes: THREE.Mesh[]
   * }}
   */
  const { bones, meshes } = useMemo(() => {
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
    return { bones, meshes }
  }, [path])

  useBlendShapes(({ blendShapes, eyeRotation, headRotation }) => {
    // Update bones
    bones.head.rotation.fromArray(headRotation)

    // Update morphs
    for (let mesh of meshes) {
      for (let key in blendShapes) {
        const i = mesh.morphTargetDictionary[key]
        mesh.morphTargetInfluences[i] = blendShapes[key]
      }
    }
    bones.eyeR.rotation.fromArray(eyeRotation)
    bones.eyeR.rotation.x = -Math.PI / 2 + bones.eyeR.rotation.x
    bones.eyeR.rotation.z = Math.PI - bones.eyeR.rotation.z
    bones.eyeL.rotation.copy(bones.eyeR.rotation)
  })

  return <primitive object={scene} />
}
