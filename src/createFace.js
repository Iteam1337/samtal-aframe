import './mouth'

export const createFace = (scene) => (model, i) => {
  const id = `face-${i}`
  delete model.id // otherwise it will create millions of new elements
  let faceEl = document.getElementById(id)

  if (!faceEl) {
    faceEl = document.createElement('a-entity')
    faceEl.setAttribute('template', 'src: #face')
    faceEl.setAttribute('id', id)
    scene.appendChild(faceEl)
  }

  faceEl.setAttribute('face', model)

  const row = Math.floor(i / 7)
  const col = i % 7

  // kolumn 2 = 0
  // kolumn 3 =
  // mellan kolumner = 0.83

  faceEl.object3D.position.x = (-col - 1) * 0.83
  faceEl.object3D.position.y = row * 0.38 + 0.3
  faceEl.object3D.position.z = row * 1.25 - 2.0
}

// const camera = document.getElementById(id)
