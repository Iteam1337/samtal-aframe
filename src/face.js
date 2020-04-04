import './mouth'
import { getPositionArray } from './helpers'

export const createFace = (scene) => (
  { position, leftEyebrow, rightEyebrow, tilt, mouth },
  i
) => {
  const id = `face-${i}`
  let faceEl = document.getElementById(id)

  console.log('face', position)

  if (!faceEl) {
    faceEl = document.createElement('a-entity')
    faceEl.setAttribute('template', 'src: #face')
    faceEl.setAttribute('id', id)
    scene.appendChild(faceEl)
  }

  const headEl = faceEl.getElementsByClassName('thehead')[0]

  const mouthEl = faceEl.getElementsByClassName('mouth')[0]

  if (mouthEl) {
    mouthEl.position = mouth.position
    mouthEl.object3D.scale.x = mouth.width * 10
    mouthEl.object3D.scale.y = mouth.height * 5
  }

  const leftEyebrowEl = faceEl.getElementsByClassName('leftEyebrow')[0]

  if (leftEyebrowEl) {
    leftEyebrowEl.object3D.rotation.set(
      THREE.Math.degToRad(0),
      THREE.Math.degToRad(0),
      THREE.Math.degToRad(leftEyebrow.tilt)
    )
  }

  const rightEyebrowEl = faceEl.getElementsByClassName('rightEyebrow')[0]

  if (rightEyebrowEl) {
//    const line = rightEyebrow.shape.reduce((prev, b) => prev + ` end: ${getPositionArray(b).join(' ')}; start: ${getPositionArray(b).join(' ')};`, '')
//    rightEyebrowEl.setAttribute('line', `${line} color: #f00`)
    //rightEyebrowEl.setAttribute('scale', '2 2 2')
    rightEyebrowEl.object3D.rotation.set(
      THREE.Math.degToRad(0),
      THREE.Math.degToRad(0),
      THREE.Math.degToRad(rightEyebrow.tilt)
    )
  }

  const row = Math.floor(i / 8)
  faceEl.object3D.position.x = -(i % 8) * 0.65 /* + position.x*/ + 0.2
  faceEl.object3D.position.y = row * 0.4 /*+ position.y*/ + 1.3
  faceEl.object3D.position.z = row * 1.4 /*+ position.z*/ - 0.7
  faceEl.color = `rgba(255, 255, 255)`

  if (headEl) {
    headEl.object3D.position.x = position.x;
    headEl.object3D.position.y = position.y;
    headEl.object3D.position.z = position.z - 1.5;
    headEl.object3D.rotation.set(
      THREE.Math.degToRad(0),
      THREE.Math.degToRad(parseFloat(tilt.toFixed(2))),
      THREE.Math.degToRad(0)
    )
  }

  // const camera = document.getElementById(id)
}
