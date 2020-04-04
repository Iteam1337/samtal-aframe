import './mouth'
export const createFace = (scene) => (
  { position, leftEyebrow, rightEyebrow, tilt, mouth },
  i
) => {
  const id = `face-${i}`
  let faceEl = document.getElementById(id)

  if (!faceEl) {
    faceEl = document.createElement('a-entity')
    faceEl.setAttribute('template', 'src: #face')
    faceEl.setAttribute('id', id)
    scene.appendChild(faceEl)
  }

  const mouthEl = faceEl.getElementsByClassName('mouth')[0]

  if (mouthEl) {
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
    //rightEyebrowEl.setAttribute('line', `start: ${rightEyebrow.shape[0].join(' ')}; end: ${rightEyebrow.shape[5].join(' ')};`)
    rightEyebrowEl.object3D.rotation.set(
      THREE.Math.degToRad(0),
      THREE.Math.degToRad(0),
      THREE.Math.degToRad(rightEyebrow.tilt)
    )
  }

  faceEl.object3D.position.x = -i * 0.8 + position.x + 0.2
  faceEl.object3D.position.y = 1.3 + position.y
  faceEl.object3D.position.z = -0.8 + position.z

  faceEl.object3D.rotation.set(
    THREE.Math.degToRad(0),
    THREE.Math.degToRad(parseFloat(tilt.toFixed(2))),
    THREE.Math.degToRad(0)
  )
}
