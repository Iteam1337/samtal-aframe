import 'babel-polyfill' // need this for some reason

import minecraftCube from '../assets/minecraft.png'
import sceneBackground from '../assets/cineroom.gltf'
import { createFace } from './face'
import { pick, calculateTilt, getPositions, midpoint, diff } from './helpers.js'

const room = document.querySelector('#room')
room.setAttribute('src', sceneBackground)

let socket = io('localhost:8000')
const scene = document.querySelector('a-scene')

const timeout = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const isPresenter = true

const detectFace = async (model, video, emitFace) => {
  const faces = await Promise.race([model.estimateFaces(video), timeout(500)])

  faces &&
    faces.forEach((face, i) => {
      const strippedFace = {
        id: i,
        position: getPositions(face.annotations.midwayBetweenEyes[0]),
        tilt: calculateTilt(face),
        leftEye: getPositions(face.annotations.leftEyeUpper0[3]),
        rightEye: getPositions(face.annotations.rightEyeUpper0[3]),
        mouth: {
          position: midpoint(
            getPositions(face.annotations.lipsUpperOuter[5]),
            getPositions(face.annotations.lipsLowerOuter[5])
          ),
          height: diff(
            getPositions(face.annotations.lipsUpperOuter[4]),
            getPositions(face.annotations.lipsLowerOuter[4])
          ).y,
          width: diff(
            getPositions(face.annotations.lipsLowerOuter[0]),
            getPositions(face.annotations.lipsLowerOuter[0])
          ).x,
        },
      }
      emitFace(strippedFace)
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
