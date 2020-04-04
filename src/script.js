import 'babel-polyfill' // need this for some reason

import minecraftCube from '../assets/minecraft.png'
import sceneBackground from '../assets/cineroom.gltf'
import { createFace } from './face'
import {
  pick,
  calculateTilt,
  calculateEyebrowTilt,
  calculateExpressions,
  getPositions,
  midpoint,
  diff,
  timeout,
} from './helpers.js'

const room = document.querySelector('#room')
const scene = document.querySelector('a-scene')

room.setAttribute('src', sceneBackground)

const socket = io()
const isPresenter = true

const detectFace = async (model, video, emitFace) => {
  const faces = await Promise.race([model.estimateFaces(video), timeout(500)])

  faces &&
    faces.forEach((face, i) => {
      const { annotations } = face

      const strippedFace = {
        id: i,
        position: getPositions(annotations.midwayBetweenEyes[0]),
        tilt: calculateTilt(face),
        leftEye: getPositions(annotations.leftEyeUpper0[3]),
        rightEye: getPositions(annotations.rightEyeUpper0[3]),
        leftEyebrow: {
          tilt: calculateEyebrowTilt(annotations.leftEyebrowUpper),
          position: getPositions(annotations.leftEyebrowLower[4]),
        },
        rightEyebrow: {
          tilt: calculateEyebrowTilt(annotations.rightEyebrowUpper),
          shape: annotations.rightEyebrowLower
        },
        mouth: {
          shape: [...annotations.lipsUpperOuter, ...annotations.lipsLowerOuter.reverse()],
          position: midpoint(
            getPositions(annotations.lipsUpperOuter[5]),
            getPositions(annotations.lipsLowerOuter[5])
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

      const faceWithExpressions = {...strippedFace, expressions: calculateExpressions(strippedFace)}

      emitFace(faceWithExpressions)
    })

  return detectFace(model, video, emitFace)
}

async function main() {
  const video = document.querySelector('video')
  await tf.ready()
  const model = await facemesh.load()

  detectFace(model, video, (face) => {
    socket.emit('face', face)
  })
}

socket.on('faces', (faces) => {
  if (!AFRAME.scenes.length) {
    return
  }

  faces.forEach(createFace(scene))
})

const startStream = async (video) => {
  try {
    const video = document.querySelector('video')
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' },
    })

    if (!stream) {
      throw new Error('You need to allow video to use this service.')
    }

    video.srcObject = stream
    video.onloadeddata = () => main()
  } catch (err) {
    alert(
      'Sorry. You need to use Google Chrome or Firefox to use this. ' +
        err.message
    )
  }
}

startStream()
