import 'babel-polyfill' // need this for some reason

import minecraftCube from './minecraft.png'
import sceneBackground from './cineroom.gltf'

const room = document.querySelector('#room')
room.setAttribute('src', sceneBackground)

let socket = io('localhost:8000')
const scene = document.querySelector('a-scene')

const timeout = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const isPresenter = true

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

const getPositions = (annotation) => {
  const [x, y, z] = annotation.map((p) => p / 1000)

  return { x, y: -y, z }
}

const midpoint = (pointA, pointB) => ({
  x: (pointA.x + pointB.x) / 2,
  y: (pointA.y + pointB.y) / 2,
  z: (pointA.z + pointB.z) / 2,
})

const diff = (pointA, pointB) => ({
  x: pointA.x - pointB.x,
  y: pointA.y - pointB.y,
  z: pointA.z - pointB.z,
})

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

  faces.forEach(({ position, rightEye, leftEye, tilt }, i) => {
    let faceEl = document.getElementById(`face-${i}`)

    if (!faceEl) {
      faceEl = document.createElement('a-entity')
      faceEl.setAttribute('template', 'src: #face')
      faceEl.setAttribute('id', `face-${i}`)
      faceEl.setAttribute('data-position', `${i} 1 -2`)
      scene.appendChild(faceEl)
    }

    faceEl.setAttribute(
      'data-lefteyeposition',
      `${leftEye.x} ${leftEye.y} ${leftEye.z}`
    )
    faceEl.setAttribute(
      'data-righteyeposition',
      `${rightEye.x} ${rightEye.y} ${rightEye.z}`
    )
    faceEl.setAttribute('data-rotation', `0 ${tilt} 0`)
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
