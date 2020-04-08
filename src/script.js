import 'babel-polyfill' // need this for some reason

import './styles.css'
import './camera'
import cuid from 'cuid'
import minecraftCube from '../assets/minecraft.png'
import sceneBackground from '../assets/cineroom.gltf'
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
import {
  nets,
  loadFaceExpressionModel,
  detectSingleFace,
  SsdMobilenetv1Options,
  TinyFaceDetectorOptions,
} from 'face-api.js'

const room = document.querySelector('#room')
const scene = document.querySelector('a-scene')

room.setAttribute('src', sceneBackground)

const userId = 'viroom/userid'

if (!localStorage.getItem(userId)) {
  localStorage.setItem(userId, cuid())
}

const SSD_MOBILENETV1 = 'ssd_mobilenetv1'
const TINY_FACE_DETECTOR = 'tiny_face_detector'

let selectedFaceDetector = SSD_MOBILENETV1

// ssd_mobilenetv1 options
let minConfidence = 0.5

// tiny_face_detector options
let inputSize = 512
let scoreThreshold = 0.5

const getFaceDetectorOptions = () => {
  return selectedFaceDetector === SSD_MOBILENETV1
    ? new SsdMobilenetv1Options({ minConfidence })
    : new TinyFaceDetectorOptions({ inputSize, scoreThreshold })
}

const findBestExpression = (expressions) => {
  let bestExpression
  let bestExpressionValue = 0

  Object.keys(expressions).forEach((expressionName) => {
    if (expressions[expressionName] > bestExpressionValue) {
      bestExpressionValue = expressions[expressionName]
      bestExpression = expressionName
    }
  })

  return bestExpression
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
    faces.forEach(async (face, i) => {
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

      let options = getFaceDetectorOptions()
      const detections = await detectSingleFace(
        video,
        options
      ).withFaceExpressions()

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
        mood: detections
          ? findBestExpression(detections.expressions)
          : 'neutral',
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

      emitFace(strippedFace)
    })

  return detectFace(model, video, emitFace)
}

async function main() {
  const video = document.querySelector('#video')
  await tf.ready()
  console.log('loading models...')
  const model = await facemesh.load()
  console.log('finished loading models...')

  await nets.ssdMobilenetv1.load('/weights/')
  console.log('face-api: lodaded model')
  await loadFaceExpressionModel('/weights/')
  console.log('face-api: lodaded weights')

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
    console.error(err)
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
