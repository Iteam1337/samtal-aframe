import 'babel-polyfill' // need this for some reason
import * as facemesh from '@tensorflow-models/facemesh'

import * as tf from '@tensorflow/tfjs-core'
import * as tfjsWasm from '@tensorflow/tfjs-backend-wasm'
// TODO(annxingyuan): read version from tfjsWasm directly once
// https://github.com/tensorflow/tfjs/pull/2819 is merged.
import {version} from '@tensorflow/tfjs-backend-wasm/dist/version'

tfjsWasm.setWasmPath(
    `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${
        version}/dist/tfjs-backend-wasm.wasm`)


import './styles.css'
import './camera'
import './emoji'
import cuid from 'cuid'
import { createFace } from './createFace'
import {
  pick,
  calculateTilt,
  calculateRoll,
  calculateYaw,
  calculateExpressions,
  averagePosition,
  getPositions,
  midpoint,
  diff,
  timeout,
  dist,
  lerpclamp,
} from './helpers.js'

const room = document.querySelector('#room')
const scene = document.querySelector('a-scene')

const userId = 'viroom/userid'

if (!localStorage.getItem(userId)) {
  localStorage.setItem(userId, cuid())
}

const socket = io()
const isPresenter = true
let movingAverageCenter = {
  x: 0,
  y: 0,
  z: 0,
}

const detectFace = async (model, video, emitFace) => {
  const faces = await Promise.race([model.estimateFaces(video), timeout(500)])
  faces &&
    faces.forEach((face, i) => {
      const { annotations } = face

      const center = getPositions(annotations.midwayBetweenEyes[0])

      movingAverageCenter.x *= 0.6
      movingAverageCenter.y *= 0.6
      movingAverageCenter.z *= 0.6

      movingAverageCenter.x += 0.4 * center.x
      movingAverageCenter.y += 0.4 * center.y
      movingAverageCenter.z += 0.4 * center.z

      const baseTilt = calculateTilt(face) / 2.0 // turn head, look left/right
      const baseYaw = calculateYaw(face) / 1.5 // look up/down
      const baseRoll = calculateRoll(face) // roll head left/right shoulder to shoulder

      const leftEyeBottom = averagePosition(annotations.leftEyeLower0)
      const leftEyebrowTop = averagePosition(annotations.leftEyebrowUpper)
      const leftEyebrowPosition = lerpclamp(
        dist(leftEyeBottom, leftEyebrowTop),
        20,
        40,
        0,
        1
      ) // distances seems to be in the range 20-40 ish

      const rightEyeBottom = averagePosition(annotations.rightEyeLower0)
      const rightEyebrowTop = averagePosition(annotations.rightEyebrowUpper)
      const rightEyebrowPosition = lerpclamp(
        dist(rightEyeBottom, rightEyebrowTop),
        20,
        40,
        0,
        1
      )

      const strippedFace = {
        id: i,
        userId: localStorage.getItem(userId),
        position: diff(movingAverageCenter, center),
        tilt: baseTilt,
        roll: baseRoll,
        yaw: baseYaw,
        leftEye: diff(center, getPositions(annotations.leftEyeUpper0[3])),
        rightEye: diff(center, getPositions(annotations.rightEyeUpper0[3])),
        leftEyebrow: leftEyebrowPosition,
        rightEyebrow: rightEyebrowPosition,
        mouth: {
          position: diff(
            center,
            midpoint(
              getPositions(annotations.lipsUpperOuter[5]),
              getPositions(annotations.lipsLowerOuter[5])
            )
          ),
          height: diff(
            getPositions(annotations.lipsUpperOuter[5]),
            getPositions(annotations.lipsLowerOuter[4])
          ).y,
          width: diff(
            getPositions(annotations.lipsUpperOuter[0]),
            getPositions(annotations.lipsLowerOuter[9])
          ).x,
        },
      }

      const faceWithExpressions = {
        ...strippedFace,
        expressions: calculateExpressions(strippedFace),
      }

      emitFace(faceWithExpressions)
    })
  
  requestAnimationFrame(() => detectFace(model, video, emitFace))
}

async function main() {
  const video = document.querySelector('#video')
  console.log('loading models...')
  await tf.setBackend('wasm')
  const model = await facemesh.load()
  console.log('finished loading models...')

  detectFace(model, video, (face) => {
    socket.emit('face', face)
  })
}

function createMockFace(id) {
  return {
    id: id,
    position: {
      x: -1 + Math.random() * 2,
      y: -1 + Math.random() * 2,
      z: -1 + Math.random() * 2,
    },
    tilt: -25 + Math.random() * 50,
    yaw: -25 + Math.random() * 50,
    roll: -25 + Math.random() * 50,
    leftEyebrow: Math.random() * 1.0,
    rightEyebrow: Math.random() * 1.0,
    mouth: {
      height: Math.random() * 1.0,
      width: Math.random() * 1.0,
    },
    expressions: {
      smile: 0,
    },
  }
}

let useSocket = true
global.debugFaces = () => {
  useSocket = false

  for (var i = 0; i < 40; i++) createFace(scene)(createMockFace(`face${i}`), i)

  setInterval(() => {
    for (var i = 0; i < 40; i += 4)
      createFace(scene)(createMockFace(`face${i}`), i)
  }, 600)
  setInterval(() => {
    for (var i = 1; i < 40; i += 4)
      createFace(scene)(createMockFace(`face${i}`), i)
  }, 700)
  setInterval(() => {
    for (var i = 2; i < 40; i += 4)
      createFace(scene)(createMockFace(`face${i}`), i)
  }, 800)
  setInterval(() => {
    for (var i = 3; i < 40; i += 4)
      createFace(scene)(createMockFace(`face${i}`), i)
  }, 900)
}

socket.on('faces', (faces) => {
  if (!AFRAME.scenes.length) {
    return
  }
  if (!useSocket) {
    return
  }

  faces.forEach(createFace(scene))
})

const startStream = async (video) => {
  try {
    document.getElementById('btn-emoji').style.display = 'block'

    const video = document.querySelector('#video')
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' },
    })

    if (!stream) {
      throw new Error('You need to allow video to use this service.')
    }
    console.log('setting video to stream')
    video.srcObject = stream
    video.onloadeddata = () => main()
  } catch (err) {
    alert(
      'Sorry. We got an error. Please make sure you use Google Chrome. You can still walk around in the room. ' +
        err.message
    )
  }
}

setTimeout(() => {
  if (
    confirm(`Welcome to Viroom!
 This is a made in #hackthecrisis to help conferences, meetings, webinars, theaters and others to get better contact with the audience. 

 If you are on mobile the expericence is better if you press Cancel on the following question, you can still look around.
 
 Would you like to share your facial expressions with this service?
 (It will take a few seconds before your avatar pops up...)
 
 Privacy: No data is being saved on the server and all data is encrypted.
 
 Take a seat!`)
  ) {
    startStream()
  }
}, 5000)

const camera1 = document.querySelector('#camera-first')
const camerarig1 = document.querySelector('#first-camera-rig')
camerarig1.object3D.lookAt(3, 1, 6)
camerarig1.object3D.position.set(4, 1.5, 1)
