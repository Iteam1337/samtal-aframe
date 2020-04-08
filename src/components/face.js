import KalmanFilter from 'kalmanjs'

AFRAME.registerComponent('face', {
  schema: {
    userId: { type: 'string' },
    dummy: { type: 'number' },
    position: { type: 'vec3' },
    tilt: { type: 'number' },
    roll: { type: 'number' },
    yaw: { type: 'number' },
    expressions: {
      smile: { type: 'number' },
    },
    leftEye: { type: 'number' },
    rightEye: { type: 'number' },
    leftEyebrow: { type: 'number' },
    rightEyebrow: { type: 'number' },
    mouth: {
      height: { type: 'number' },
      width: { type: 'number' },
    },
  },

  init: function (data) {
    console.log('init face', this.data)
    this.leftEyebrowLerp = new KalmanFilter()
    this.rightEyebrowLerp = new KalmanFilter()
    this.rollLerp = new KalmanFilter()
    this.yawLerp = new KalmanFilter()
    this.tiltLerp = new KalmanFilter()
    this.pxLerp = new KalmanFilter()
    this.pyLerp = new KalmanFilter()
    this.pzLerp = new KalmanFilter()
    this.mwLerp = new KalmanFilter()
    this.mhLerp = new KalmanFilter()
    this.isCurrentUser =
      this.data.userId === localStorage.getItem('viroom/userid')

    this.lastmodel = ''
  },

  remove: function () {
    // Do something the component or its entity is detached.
  },

  tick: function (time, timeDelta) {
    // update all interpolators
    const leftEyebrowValue = this.leftEyebrowLerp.filter(this.data.leftEyebrow)
    const rightEyebrowValue = this.rightEyebrowLerp.filter(this.data.rightEyebrow)
    const rollValue = this.rollLerp.filter(this.data.roll)
    const yawValue = this.yawLerp.filter(this.data.yaw)
    const tiltValue = this.tiltLerp.filter(this.data.tilt)
    const pxValue = this.pxLerp.filter(this.data.position.x)
    const pyValue = this.pyLerp.filter(this.data.position.y)
    const pzValue = this.pzLerp.filter(this.data.position.z)
    const mwValue = this.pzLerp.filter(this.data.mouth.width)
    const mhValue = this.pzLerp.filter(this.data.mouth.height)

    const mouthEl = this.el.getElementsByClassName('mouth')[0]

    if (mouthEl) {
      mouthEl.object3D.scale.x = mwValue * 0.8
      mouthEl.object3D.scale.y = mhValue * 0.4
    }

    const leftEyebrowEl = this.el.getElementsByClassName('leftEyebrow')[0]

    if (leftEyebrowEl) {
      leftEyebrowEl.object3D.position.y = leftEyebrowValue * 0.35 + 0.45
    }

    const rightEyebrowEl = this.el.getElementsByClassName('rightEyebrow')[0]

    if (rightEyebrowEl) {
      rightEyebrowEl.object3D.position.y = rightEyebrowValue * 0.35 + 0.45
    }

    const neckEl = this.el.getElementsByClassName('theneck')[0]

    if (neckEl) {
      neckEl.object3D.position.x = pxValue * 0.1
      neckEl.object3D.position.y = pyValue * 0.1 + 0.6
      neckEl.object3D.position.z = pzValue * 0.1
    }

    const headEl = this.el.getElementsByClassName('thehead')[0]
    const markerEl = this.el.getElementsByClassName('themarker')[0]

    if (this.isCurrentUser && markerEl) {
      markerEl.setAttribute('visible', 'true')
    }

    if (headEl) {
      headEl.object3D.setRotationFromEuler(
        new THREE.Euler(
          THREE.Math.degToRad(yawValue),
          THREE.Math.degToRad(tiltValue),
          THREE.Math.degToRad(rollValue),
          'ZYX'
        )
      )
    }
  },
})
