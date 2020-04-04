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

    
    const headEl = this.el.getElementsByClassName('thehead')[0]
    const mouthEl = this.el.getElementsByClassName('mouth')[0]

    console.log('head', headEl)

    if (mouthEl) {
      mouthEl.position = this.data.mouth.position
      mouthEl.object3D.scale.x = this.data.mouth.width * 0.8
      mouthEl.object3D.scale.y = this.data.mouth.height * 0.4
    }

    const leftEyebrowEl = this.el.getElementsByClassName('leftEyebrow')[0]

    if (leftEyebrowEl) {
      leftEyebrowEl.object3D.rotation.set(
        THREE.Math.degToRad(0),
        THREE.Math.degToRad(0),
        THREE.Math.degToRad(this.data.leftEyebrow.tilt)
      )
    }

    const rightEyebrowEl = this.el.getElementsByClassName('rightEyebrow')[0]

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

    this.el.color = `rgba(255, 255, 255)`
    if (headEl) {
      headEl.object3D.position.x = this.data.position.x * 0.1;
      headEl.object3D.position.y = this.data.position.y * 0.1 +  0.6;
      headEl.object3D.position.z = this.data.position.z * 0.1
      headEl.object3D.rotation.set(
        THREE.Math.degToRad(0),
        THREE.Math.degToRad(parseFloat(this.data.tilt.toFixed(2))),
        THREE.Math.degToRad(0)
      )
    }
  }
});