export const createFace = (scene) => ({ position, tilt }, i) => {
  let faceEl = document.getElementById(`face-${i}`)

  if (!faceEl) {
    faceEl = document.createElement('a-entity')
    faceEl.setAttribute('template', 'src: #face')
    faceEl.setAttribute('id', `face-${i}`)
    scene.appendChild(faceEl)
  }

  faceEl.object3D.position.x = i
  faceEl.object3D.position.y = 1
  faceEl.object3D.position.z = -2

  faceEl.object3D.rotation.set(
    THREE.Math.degToRad(0),
    THREE.Math.degToRad(tilt),
    THREE.Math.degToRad(0)
  )
}
