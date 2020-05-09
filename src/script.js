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
import { mod } from '@tensorflow/tfjs-core'

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
  const faces = await model.estimateFaces(video)
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
        //annotations: annotations,
        leftEye: diff(center, getPositions(annotations.leftEyeUpper0[3])),
        rightEye: diff(center, getPositions(annotations.rightEyeUpper0[3])),
        leftEyebrow: leftEyebrowPosition,
        rightEyebrow: rightEyebrowPosition,
        leftCheek: diff(center, getPositions(annotations.leftCheek[0])),
        rightCheek: diff(center, getPositions(annotations.rightCheek[0])),
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
  requestAnimationFrame(() => {
    detectFace(model, video, emitFace)
  })
}

async function main() {
  const video = document.querySelector('#video')
  console.log('loading models...')
  await tf.ready()
  const model = await facemesh.load()
  console.log('finished loading models...')

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


const startJitsi = (roomName) => {
  JitsiMeetJS.init()
  var connection = new JitsiMeetJS.JitsiConnection(null, null, {
    hosts: {
      domain: 'beta.meet.jit.si',
      muc: 'conference.beta.meet.jit.si', // FIXME: use XEP-0030
      focus: 'focus.beta.meet.jit.si',
    },
    bosh:'https://beta.meet.jit.si/http-bind', 
    clientNode: 'http://jitsi.org/jitsimeet'
  })
  connection.connect();
  connection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED, () => {
    console.log('Jitsi connection established')
    const room = connection.initJitsiConference(roomName, {
      // add options here
    })
    function onLocalTracks(tracks) {
      localTracks = tracks
      localTracks.forEach((track, i) => {
        console.log('track', track)
        if (track.getType() === 'video') {
          const video = document.createElement('video')
          video.id = `localVideo${i}`
          document.body.appendChild(video)
          document.getElementById('bigscreen').src = '#' + video.id
          track.attach(video)
        } else {
          const audio = document.createElement('audio')
          audio.id = `localAudio${i}`
          document.body.appendChild(audio)
          track.attach(audio);
        }
        if (isJoined) {
            room.addTrack(track);
        }
      })
    }
    console.log('Creating local tracks...')
    JitsiMeetJS.createLocalTracks().then(onLocalTracks);
  })
}


/*setTimeout(() => {
  if (
    confirm(`Welcome to VR meet!

This is our public hall. Feel free to test the service here.
  
Would you like to share your facial expressions with this service?
We take your privacy seriously, read more at vrmeet.io/tech.

Take a seat and don't forget to invite your friends!`)
) {
    startStream()
    // startJitsi('stage.vrmeet.io')
  }
}, 1000)
*/
    startStream()

