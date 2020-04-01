import 'babel-polyfill' // need this for some reason
import io from 'socket.io-client'
import broadcaster from './broadcaster'
import watcher from './watcher'

const isPresenter = !!localStorage.getItem('isPresenter')

isPresenter ? broadcaster.init() : watcher.init()

import minecraftCube from './minecraft.png'
import sceneBackground from './cineroom.gltf'

const room = document.querySelector('#room')

room.setAttribute('src', sceneBackground)

const camera = document.querySelector('#rig')
const positionCamera = (isPresenter) => {
  if (isPresenter) {
    isPresenter && camera.setAttribute('rotation', '-20 180 0')
    camera.setAttribute('position', '-1 3 -6')
  }
}

// positionCamera(isPresenter)

const socket = io('localhost:8000')
const scene = document.querySelector('a-scene')

const timeout = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const pick = (obj, keys) =>
  keys
    .map((k) => (k in obj ? { [k]: obj[k] } : {}))
    .reduce((res, o) => Object.assign(res, o), {})

const calculateTilt = ({ annotations }) => {
  const dX = annotations.rightCheek[0][0] - annotations.leftCheek[0][0]
  const dY = annotations.rightCheek[0][1] - annotations.leftCheek[0][1]
  // const dZ = annotations.rightCheek[0][2] - annotations.leftCheek[0][2]
  const degree = Math.atan(dY / dX) * 180

  return degree
}

const calculatePosition = ({ annotations }) => {
  const [x, y, z] = annotations.midwayBetweenEyes[0].map((p) => p / 1000)

  return { x, y: -y, z }
}

const detectFace = async (model, video, emitFace) => {
  const faces = await Promise.race([model.estimateFaces(video), timeout(500)])

  faces &&
    faces.forEach((face, i) => {
      const strippedFace = {
        id: i,
        position: calculatePosition(face),
        tilt: calculateTilt(face),
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

  faces.forEach((face, i) => {
    let faceEl = document.getElementById(`face-${i}`)

    if (!faceEl) {
      faceEl = document.createElement('a-box')

      faceEl.setAttribute('position', '0 0 -4')
      faceEl.setAttribute('material', `src: ${minecraftCube}; repeat: 1 1`)
      faceEl.setAttribute('a-face')
      faceEl.setAttribute('scale', '0.8 0.8')
      faceEl.setAttribute('id', `face-${i}`)

      scene.appendChild(faceEl)
    }

    faceEl.setAttribute('rotation', `0 ${face.tilt} 0`)
    faceEl.setAttribute('position', face.position)
    faceEl.object3D.position.y += 1.5
    faceEl.object3D.position.x += i
    faceEl.object3D.position.z = -2
  })
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
