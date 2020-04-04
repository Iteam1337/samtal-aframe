import './mouth'
import { getPositionArray } from './helpers'

export const createFace = (scene) => (
  model,
  i
) => {
  const id = `face-${i}`
  delete model.id // otherwise it will create millions of new elements
  let faceEl = document.getElementById(id)
  let originalPosition

  if (!faceEl) {
    faceEl = document.createElement('a-entity')
    faceEl.setAttribute('template', 'src: #face')
    faceEl.setAttribute('id', id)
    originalPosition = model.position
    scene.appendChild(faceEl)
  } else {
    originalPosition = faceEl.originalPosition
  }
  faceEl.setAttribute('face', model)
//  for(let key in model) faceEl.setAttribute(key, JSON.stringify(model[key]))

  const row = Math.floor(i / 7)
  const col = i % 7

  // kolumn 2 = 0
  // kolumn 3 = 
  // mellan kolumner = 0.83

  faceEl.object3D.position.x = ((-col - 1) * 0.83)
  faceEl.object3D.position.y = (row * 0.38) + 0.3
  faceEl.object3D.position.z = (row * 1.25) - 2.0

  faceEl.object3D.rotation.set(
    THREE.Math.degToRad(0),
    THREE.Math.degToRad(parseFloat(model.tilt.toFixed(2))),
    THREE.Math.degToRad(0)
  )
}

// const camera = document.getElementById(id)
