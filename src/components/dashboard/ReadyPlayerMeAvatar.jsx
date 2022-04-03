import { useBlendShapes } from "@/context/Facetracking"
import { dampQuaternions } from "@/utils/dampQuaternions"
import { useGLTF } from "@react-three/drei"
import { useFrame, useGraph } from "@react-three/fiber"
import { useMemo, useState } from "react"
import * as THREE from "three"
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils"

const LAMBDA = 50
const euler = new THREE.Euler()

export function ReadyPlayerMeAvatar({ path }) {
  const { scene } = useGLTF(path)
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene])
  const { nodes } = useGraph(clone)
  const [target] = useState(() => ({
    blendShapes: {},
    eyeQuaternion: new THREE.Quaternion(),
    headQuaternion: new THREE.Quaternion(),
  }))

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
    clone.traverse((object) => {
      if (object.isMesh && object.morphTargetInfluences?.length > 0) {
        meshes.push(object)
      }
    })
    return { bones, meshes }
  }, [nodes])
  useBlendShapes(({ blendShapes, eyeRotation, headQuaternion }) => {
    Object.assign(target.blendShapes, blendShapes)
    euler.fromArray(eyeRotation)
    euler.x = -Math.PI / 2 + euler.x
    euler.z = Math.PI - euler.z
    target.eyeQuaternion.setFromEuler(euler)
    target.headQuaternion.copy(headQuaternion)
  })
  useFrame((_, dt) => {
    // Update bones
    dampQuaternions(bones.head.quaternion, target.headQuaternion, LAMBDA, dt)

    // Update morphs
    for (let mesh of meshes) {
      for (let key in target.blendShapes) {
        const i = mesh.morphTargetDictionary[key]
        const from = mesh.morphTargetInfluences[i] ?? 0
        const to = target.blendShapes[key] ?? 0
        mesh.morphTargetInfluences[i] = THREE.MathUtils.damp(from, to, LAMBDA, dt)
      }
    }
    dampQuaternions(bones.eyeR.quaternion, target.eyeQuaternion, LAMBDA, dt)
    bones.eyeL.rotation.copy(bones.eyeR.rotation)
  })

  return <primitive object={clone} />
}
