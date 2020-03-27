const socket = io(':8000')
const scene = document.querySelector('a-scene')

const timeout = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const pick = (obj, keys) =>
  keys
    .map((k) => (k in obj ? { [k]: obj[k] } : {}))
    .reduce((res, o) => Object.assign(res, o), {})

const calculateTilt = ({ annotations }) => {

  const pitchAng = Math.atan2( hand.direction[1] , -hand.direction[2] )
      palm2.rotation.x = pitchAng

      const rollAng = Math.atan2( hand.palmNormal[0], hand.palmNormal[1] )
      palm2.rotation.z = rollAng             

      const yawAng = Math.atan2( hand.direction[0], -hand.direction[1] )
      palm2.rotation.y = yawAng
      
  const dX = annotations.rightCheek[0][0] - annotations.leftCheek[0][0]
  const dY = annotations.rightCheek[0][1] - annotations.leftCheek[0][1]
  // const dZ = annotations.rightCheek[0][2] - annotations.leftCheek[0][2]
  const degree = Math.atan(dY / dX) * 180
  return degree
}

const calculatePosition = ({annotations}) => {
  const [x, y, z] = annotations.midwayBetweenEyes[0].map(p => p / 1000)
  return {x, y, z}
}

const detectFace = async (model, video, emitFace) => {
  const faces = await Promise.race([
    model.estimateFaces(video),
    timeout(500)
  ])

  faces && faces.forEach((face, i) => {
    const strippedFace = {
      id: i,
      position: calculatePosition(face),
      tilt: calculateTilt(face),
    }
    emitFace(strippedFace)
  })

  return detectFace(model, video, emitFace)
}

async function main () {
  const video = document.querySelector('video')
  //tfjsWasm.setWasmPath(`https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm/dist/tfjs-backend-wasm.wasm`)
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
      console.log('create')
      faceEl.setAttribute('position', '0 0 -4')
      // faceEl.setAttribute('material', 'src: minecraft.png; repeat: 1 1')
      faceEl.setAttribute('a-face')
      faceEl.setAttribute('scale', '0.8 0.8')
      faceEl.setAttribute('id', `face-${i}`)

      scene.appendChild(faceEl)
    }
    faceEl.setAttribute('rotation', `0 ${face.tilt} 0`)
    faceEl.setAttribute('position', face.position)
    faceEl.object3D.position.y += 1.5
    faceEl.object3D.position.x += i
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
    video.onloadeddata = () => {
      main()
    }
  } catch (err) {
    alert(
      'Sorry. You need to use Google Chrome or Firefox to use this. ' +
        err.message
    )
  }
}

startStream()