/**
 * @param {BlendShapes} blendShapes
 * @returns {BlendShapes}
 */
export function remapBlendShapes(blendShapes) {
  return Object.fromEntries(
    Object.keys(mirrorMap).map((name) => {
      const mirroredName = mirrorMap[name]
      let influence = blendShapes[mirroredName] ?? 0
      influence *= scaling[mirroredName] ?? 1
      return [name, influence]
    })
  )
}

/** @type {Partial<BlendShapes>} */
const scaling = {
  mouthSmileLeft: 0.6,
  mouthSmileRight: 0.6,
}

/**
 * @typedef {typeof blendShapeNames[number]} BlendShapeName
 * @typedef {Record<BlendShapeName, number>} BlendShapes
 */

export const blendShapeNames = /** @type {const} */ ([
  "browDownLeft",
  "browDownRight",
  "browInnerUp",
  "browOuterUpLeft",
  "browOuterUpRight",
  "cheekPuff",
  "cheekSquintLeft",
  "cheekSquintRight",
  "eyeBlinkLeft",
  "eyeBlinkRight",
  "eyeLookDownLeft",
  "eyeLookDownRight",
  "eyeLookInLeft",
  "eyeLookInRight",
  "eyeLookOutLeft",
  "eyeLookOutRight",
  "eyeLookUpLeft",
  "eyeLookUpRight",
  "eyeSquintLeft",
  "eyeSquintRight",
  "eyeWideLeft",
  "eyeWideRight",
  "jawForward",
  "jawLeft",
  "jawOpen",
  "jawRight",
  "mouthClose",
  "mouthDimpleLeft",
  "mouthDimpleRight",
  "mouthFrownLeft",
  "mouthFrownRight",
  "mouthFunnel",
  "mouthLeft",
  "mouthLowerDownLeft",
  "mouthLowerDownRight",
  "mouthPressLeft",
  "mouthPressRight",
  "mouthPucker",
  "mouthRight",
  "mouthRollLower",
  "mouthRollUpper",
  "mouthShrugLower",
  "mouthShrugUpper",
  "mouthSmileLeft",
  "mouthSmileRight",
  "mouthStretchLeft",
  "mouthStretchRight",
  "mouthUpperUpLeft",
  "mouthUpperUpRight",
  "noseSneerLeft",
  "noseSneerRight",
])

/** @type {(name: BlendShapeName) => BlendShapeName} */
const doMirror = (name) => {
  if (name.includes("Right")) {
    return name.replace("Right", "Left")
  } else {
    return name.replace("Left", "Right")
  }
}

/**
 * Maps e.g. "mouthSmileRight" -> "mouthSmileLeft"
 * because WebXRViewer reads mirrored blendShape values
 */
const mirrorMap = Object.fromEntries(blendShapeNames.map((name) => [name, doMirror(name)]))
