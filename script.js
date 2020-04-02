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

  faces.forEach((face, i) => {
    let faceEl = document.getElementById(`face-${i}`)
    let leftEye = document.getElementById(`face-${i}-leftEye`)
    let rightEye = document.getElementById(`face-${i}-rightEye`)
    let mouth = document.getElementById(`face-${i}-mouth`)

    if (!faceEl) {
      faceEl = document.createElement('a-sphere')

      faceEl.setAttribute('position', '0 0 -4')
      faceEl.setAttribute('material', `color: #ff0`)
      faceEl.setAttribute('a-face')
      faceEl.setAttribute('scale', '0.1 0.1 0.1')
      faceEl.setAttribute('id', `face-${i}`)
      scene.appendChild(faceEl)

      leftEye = document.createElement('a-sphere')
      leftEye.setAttribute('scale', '0.25 0.25')
      leftEye.setAttribute('id', `face-${i}-leftEye`)
      faceEl.appendChild(leftEye)

      rightEye = document.createElement('a-sphere')
      rightEye.setAttribute('scale', '0.25 0.25')
      rightEye.setAttribute('id', `face-${i}-rightEye`)
      faceEl.appendChild(rightEye)

      mouth = document.createElement('a-sphere')
      mouth.setAttribute('scale', '0.25 0.25')
      mouth.setAttribute('id', `face-${i}-mouth`)
      faceEl.appendChild(mouth)
    }

    faceEl.setAttribute('rotation', `0 ${face.tilt} 0`)
    rightEye.setAttribute('position', face.rightEye)
    leftEye.setAttribute('position', face.leftEye)
    mouth.setAttribute('position', face.mouth.position)
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
