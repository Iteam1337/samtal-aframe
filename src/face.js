export const createFace = (scene) => (
  { position, leftEyebrow, tilt, mouth },
  i
) => {
  let faceEl = document.getElementById(`face-${i}`)

  if (!faceEl) {
    faceEl = document.createElement('a-entity')
    faceEl.setAttribute('template', 'src: #face')
    faceEl.setAttribute('id', `face-${i}`)
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
      THREE.Math.degToRad(leftEyebrow.x),
      THREE.Math.degToRad(leftEyebrow.y),
      THREE.Math.degToRad(leftEyebrow.z)
    )
  }

  faceEl.object3D.position.x = i
  faceEl.object3D.position.y = 1.5
  faceEl.object3D.position.z = -3

  faceEl.object3D.rotation.set(
    THREE.Math.degToRad(0),
    THREE.Math.degToRad(tilt),
    THREE.Math.degToRad(0)
  )
}
