AFRAME.registerComponent('face', {
  schema: {
    dummy: {type: 'number'},
    position: {type: 'vec3'},
    tilt: {type: 'number'},
    leftEye: {type: 'vec3'},
    rightEye: {type: 'vec3'},
    leftEyebrow: {
      tilt: {type: 'number'},
      position: {type: 'vec3'},
    },
    rightEyebrow: {
      tilt: {type: 'number'},
      position: {type: 'vec3'},
    },
    mouth: {
      position: {type: 'vec3'},
      height: {type: 'number'},
      width: {type: 'number'},
    },
  },

  init: function (data) {
    // Do something when component first attached.

    console.log('init face', this.data)

    this.lastmodel = '';

    // this.faceEl = document.createElement('a-entity')
    // this.faceEl.setAttribute('face')
    // this.faceEl.setAttribute('template', 'src: #face')
    // this.faceEl.setAttribute('id', id)
    // this.el.appendChild(faceEl)
  },

  remove: function () {
    // Do something the component or its entity is detached.
  },

  tick: function (time, timeDelta) {
    return;

    const faceEl = this.el

    const headEl = faceEl.getElementsByClassName('thehead')[0]
    const mouthEl = faceEl.getElementsByClassName('mouth')[0]

    if (mouthEl) {
      mouthEl.position = this.data.mouth.position
      mouthEl.object3D.scale.x = this.data.mouth.width * 10
      mouthEl.object3D.scale.y = this.data.mouth.height * 5
    }

    const leftEyebrowEl = faceEl.getElementsByClassName('leftEyebrow')[0]

    if (leftEyebrowEl) {
      leftEyebrowEl.object3D.rotation.set(
        THREE.Math.degToRad(0),
        THREE.Math.degToRad(0),
        THREE.Math.degToRad(this.data.leftEyebrow.tilt)
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
        THREE.Math.degToRad(this.data.rightEyebrow.tilt)
      )
    }

    faceEl.color = `rgba(255, 255, 255)`

    if (headEl) {
      headEl.object3D.position.x = this.data.position.x;
      headEl.object3D.position.y = this.data.position.y;
      headEl.object3D.position.z = this.data.position.z - 1.5;
      headEl.object3D.rotation.set(
        THREE.Math.degToRad(0),
        THREE.Math.degToRad(parseFloat(this.data.tilt.toFixed(2))),
        THREE.Math.degToRad(0)
      )
    }
  }
});