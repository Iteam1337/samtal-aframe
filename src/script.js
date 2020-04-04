import 'babel-polyfill' // need this for some reason

import minecraftCube from '../assets/minecraft.png'
import sceneBackground from '../assets/cineroom.gltf'
import { createFace } from './createFace'
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
const averageCenters = {}

const xyzSum = arr => arr.reduce((({x, y, z}, sum) => ({x: sum.x + x, y: sum.y + y , z: sum.z + z})), {x:0, y:0, z:0})
const xyzAvg = arr => {
  if (!arr.length) return 0
  const {x, y, z} = xyzSum(arr)
  return {x: x / arr.length, y: y / arr.length, z: z / arr.length}
}

const detectFace = async (model, video, emitFace) => {
  const faces = await Promise.race([model.estimateFaces(video), timeout(500)])
  faces &&
    faces.forEach((face, i) => {

      const { annotations } = face
      const center = getPositions(annotations.midwayBetweenEyes[0])
      averageCenters[i] = (averageCenters[i] ?? []).concat([center])
      const avgCenter = xyzAvg(averageCenters[i].slice(-200))
      const baseTilt = calculateTilt(face)

      const strippedFace = {
        id: i,
        position: diff(avgCenter, center),
        tilt: baseTilt,
        leftEye: diff(center, getPositions(annotations.leftEyeUpper0[3])),
        rightEye: diff(center, getPositions(annotations.rightEyeUpper0[3])),
        leftEyebrow: {
          tilt: calculateEyebrowTilt(annotations.leftEyebrowUpper) - baseTilt,
          position: diff(center, getPositions(annotations.leftEyebrowLower[4])),
        },
        rightEyebrow: {
          tilt: calculateEyebrowTilt(annotations.rightEyebrowUpper) - baseTilt,
          position: diff(center, getPositions(annotations.rightEyebrowUpper[4])),
        },
        mouth: {
          // shape: [...annotations.lipsUpperOuter, ...annotations.lipsLowerOuter.reverse()],
          position: diff(center, midpoint(
            getPositions(annotations.lipsUpperOuter[5]),
            getPositions(annotations.lipsLowerOuter[5])
          )),
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
  const video = document.querySelector('#video')
  await tf.ready()
  console.log('loading models...')
  const model = await facemesh.load()
  console.log('finished loading models...')

  detectFace(model, video, (face) => {
    socket.emit('face', face)
  })
}

function createMockFace(id) {
  return {
    "id": id,
    "position":{"x":-1 + Math.random() * 2,"y":-1 + Math.random() * 2,"z":-1 + Math.random() * 2},
    "tilt": 0, // -45 + Math.random() * 90,//-19.224357256875063,
    "leftEye":{"x":-0,"y":-0,"z":0},
    "rightEye":{"x":-0,"y":-0,"z":-0},
    "leftEyebrow":{
      "tilt": -45 + Math.random() * 90,
      "position":{"x":0,"y":0 + Math.random() * 1,"z":0}
    },
    "rightEyebrow":{
      "tilt": -45 + Math.random() * 90,
      "position":{"x":0, "y":0 + Math.random() * 1, "z":0}
      // "shape":[{"x":-0.05760791015625,"y":0.010632156372070295,"z":0.005048468589782714},{"x":-0.05547222900390625,"y":0.0031054687500000067,"z":0.009451361656188966},{"x":-0.05160119628906251,"y":-0.003527206420898432,"z":0.012845768928527831},{"x":-0.04400604248046874,"y":-0.007974975585937516,"z":0.013873072624206544},{"x":-0.03461938476562498,"y":-0.010231292724609375,"z":0.012894545555114746},{"x":-0.023474639892578142,"y":-0.009937255859374994,"z":0.009750916481018067}]
    },
    "mouth":{
      // "shape":[[406.65484619140625,206.07290649414062,-13.658732414245605],[409.34979248046875,203.88670349121094,-16.311017990112305],[414.50189208984375,201.55191040039062,-18.023799896240234],[420.46551513671875,198.57659912109375,-18.68194007873535],[428.498291015625,195.6349334716797,-17.513084411621094],[434.8387451171875,195.51673889160156,-14.413606643676758],[439.20306396484375,194.19297790527344,-9.972518920898438],[442.45074462890625,195.28932189941406,-3.119357109069824],[443.51055908203125,197.44407653808594,3.3911333084106445],[443.72821044921875,199.25924682617188,9.875541687011719],[443.41253662109375,201.10983276367188,15.014172554016113],[443.41253662109375,201.10983276367188,15.014172554016113],[442.87664794921875,202.9060516357422,9.884639739990234],[442.349609375,204.8921661376953,4.001046180725098],[440.895751953125,207.5731964111328,-0.7196694612503052],[438.0365295410156,209.67320251464844,-6.22343635559082],[433.906005859375,210.930908203125,-10.266515731811523],[427.59210205078125,211.3096160888672,-13.6698637008667],[421.0623779296875,210.54127502441406,-15.265863418579102],[414.6666564941406,208.85829162597656,-15.080039024353027],[409.84051513671875,207.44113159179688,-14.15927791595459]],"position":{"x":-0.4343723754882812,"y":-0.2032238235473633,"z":-0.01234006118774414},
      "height": 0.0 + Math.random() * 1.0,
      "width": 0.0 + Math.random() * 1.0
    },
    "expressions":{"smile":0}
  }
}

let useSocket = true;
global.debugFaces = () => {
  useSocket = false;
  setInterval(() => {
    createFace(scene)(createMockFace('face0'), 0);
    createFace(scene)(createMockFace('face1'), 1);
    createFace(scene)(createMockFace('face2'), 2);
    createFace(scene)(createMockFace('face3'), 3);
  }, 100);
};

socket.on('faces', (faces) => {
  if (!AFRAME.scenes.length) {
    return
  }
  if (!useSocket) {
    return;
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
    alert(
      'Sorry. You need to use Google Chrome or Firefox to use this. ' +
        err.message
    )
  }
}

setTimeout(() => {
 if (confirm('Vill du dela dina ansiktsuttryck med detta rummet?\r\n (Tar några sekunder att ladda in...)\r\nIngen data sparas på servern.')) {
    startStream()
  }
}, 5000)

const camera1 = document.querySelector('#first-camera');
const camerarig1 = document.querySelector('#first-camera-rig');
camerarig1.object3D.lookAt(0, 1, -6);
camerarig1.object3D.position.set(-2, 1.5, -6);
