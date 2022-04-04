import { useBlendShapes } from "@/context/Facetracking"
import { dampQuaternions } from "@/utils/dampQuaternions"
import { useGLTF } from "@react-three/drei"
import { useFrame, useGraph } from "@react-three/fiber"
import { useMemo, useState } from "react"
import * as THREE from "three"
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils"

const LAMBDA = 50
const euler = new THREE.Euler()
const quat = new THREE.Quaternion()

export function ReadyPlayerMeAvatar({ path }) {
  const { scene } = useGLTF(path)
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene])
  const { nodes } = useGraph(clone)
  const [target] = useState(() => ({
    blendShapes: {},
    eyeRotation: new THREE.Euler(),
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
    target.eyeRotation.fromArray(eyeRotation)
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
    // Convert to RPM eye origin
    euler.copy(target.eyeRotation)
    euler.x = -Math.PI / 2 + euler.x
    euler.z = Math.PI - euler.z
    quat.setFromEuler(euler)
    dampQuaternions(bones.eyeR.quaternion, quat, LAMBDA, dt)
    bones.eyeL.rotation.copy(bones.eyeR.rotation)
  })

  return <primitive object={clone} />
}
