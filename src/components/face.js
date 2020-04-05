AFRAME.registerComponent('face', {
  schema: {
    dummy: {type: 'number'},
    position: {type: 'vec3'},
    tilt: {type: 'number'},
    roll: {type: 'number'},
    yaw: {type: 'number'},
    leftEye: {type: 'vec3'},
    rightEye: {type: 'vec3'},
    expressions: {
      smile: {type: 'number'},
    },
    leftEyebrow: {type: 'number'},
    rightEyebrow: {type: 'number'},
    mouth: {
      position: {type: 'vec3'},
      height: {type: 'number'},
      width: {type: 'number'},
    },
  },

  init: function (data) {
    // Do something when component first attached.

    console.log('init face', this.data)
    this.el.originalPosition = this.data.position

    this.lastmodel = '';
  },

  remove: function () {
    // Do something the component or its entity is detached.
  },

  tick: function (time, timeDelta) {
    const neckEl = this.el.getElementsByClassName('theneck')[0]
    const headEl = this.el.getElementsByClassName('thehead')[0]
    const mouthEl = this.el.getElementsByClassName('mouth')[0]

    if (mouthEl) {
      mouthEl.position = this.data.mouth.position
      mouthEl.object3D.scale.x = this.data.mouth.width * 0.8
      mouthEl.object3D.scale.y = this.data.mouth.height * 0.4
    }

    const leftEyebrowEl = this.el.getElementsByClassName('leftEyebrow')[0]
    if (leftEyebrowEl) {
      leftEyebrowEl.object3D.position.y = this.data.leftEyebrow * 0.3 + 0.5;
    }

    const rightEyebrowEl = this.el.getElementsByClassName('rightEyebrow')[0]
    if (rightEyebrowEl) {
      rightEyebrowEl.object3D.position.y = this.data.rightEyebrow * 0.3 + 0.5;
    }

    this.el.color = `rgba(255, 255, 255)`
    if (neckEl) {
      neckEl.object3D.position.x = this.data.position.x * 0.1;
      neckEl.object3D.position.y = this.data.position.y * 0.1 +  0.6;
      neckEl.object3D.position.z = this.data.position.z * 0.1
    }
    if (headEl) {
      headEl.object3D.setRotationFromEuler(new THREE.Euler(
        THREE.Math.degToRad(this.data.yaw),
        THREE.Math.degToRad(this.data.tilt),
        THREE.Math.degToRad(this.data.roll),
        'ZYX'
      ))
    }
  }
});