import { AUPredictor } from "@quarkworks-inc/avatar-webkit"

import SleepWorker from "./worker?worker"

const FPS = 30

const statusEl = document.querySelector("#status")

statusEl.textContent = "Initializing camera..."
document.title = "🔴 Hallway Tracker"

/**
 * @typedef {import("@quarkworks-inc/avatar-webkit").AvatarPrediction} AvatarPrediction
 */

/**
 * BroadcastChannel
 */
const bc = new BroadcastChannel("hallway")
bc.postMessage({ type: "log", payload: "hello from facetracker" })

/**
 * @typedef {(
 *    {type: 'log', payload: string} |
 *    {type: 'results', payload: AvatarPrediction}
 * )} FacetrackerAction
 */

/**
 * Hallway SDK
 */
const videoEl = document.createElement("video")
let videoStream = await navigator.mediaDevices.getUserMedia({
  audio: false,
  video: {
    width: { ideal: 640 },
    height: { ideal: 360 },
    facingMode: "user",
  },
})
videoEl.srcObject = videoStream
videoEl.autoplay = true

let predictor = new AUPredictor({
  apiToken: AVATAR_WEBKIT_AUTH_TOKEN,
})

const worker = new SleepWorker()

let timeout

async function doPredict(cb) {
  await predictor.predict(videoEl)
  cb && cb()
  if (timeout) clearTimeout(timeout)
  setTimeout(doPredict, 500) // Retry in a bit in case camera is obscured
}

worker.onmessage = () => {
  doPredict()
}

predictor.dataStream.subscribe((results) => {
  bc.postMessage({ type: "results", payload: results })
  worker.postMessage(1000 / FPS)
})

statusEl.textContent = "Initializing model..."
document.title = "🟠 Hallway Tracker"

// Start prediction loop
doPredict(() => {
  statusEl.textContent = "Tracking started"
  document.title = "🟢 Hallway Tracker"
  console.log("initialized")
})
