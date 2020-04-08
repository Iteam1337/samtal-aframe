const Lerpomato = (a = undefined, b = undefined) => {
  if (b === undefined) b = 0.01 + 0.02 * Math.random()
  if (a === undefined) a = 0.92 + 0.03 * Math.random()
  var c = 0
  var v = 0
  return {
    tick: (newvalue) => {
      v *= a
      v += b * (newvalue - c)
      c += v
      return c
    },
  }
}

AFRAME.registerComponent('face', {
  schema: {
    userId: { type: 'string' },
    dummy: { type: 'number' },
    position: { type: 'vec3' },
    tilt: { type: 'number' },
    roll: { type: 'number' },
    yaw: { type: 'number' },
    leftEye: { type: 'number' },
    rightEye: { type: 'number' },
    leftEyebrow: { type: 'number' },
    rightEyebrow: { type: 'number' },
    mood: { type: 'string' },
    mouth: {
      height: { type: 'number' },
      width: { type: 'number' },
    },
  },

  init: function (data) {
    console.log('init face', this.data)
    this.leftEyebrowLerp = new Lerpomato()
    this.rightEyebrowLerp = new Lerpomato()
    this.rollLerp = new Lerpomato()
    this.yawLerp = new Lerpomato()
    this.tiltLerp = new Lerpomato()
    this.pxLerp = new Lerpomato()
    this.pyLerp = new Lerpomato()
    this.pzLerp = new Lerpomato()
    this.mwLerp = new Lerpomato()
    this.mhLerp = new Lerpomato()
    this.isCurrentUser =
      this.data.userId === localStorage.getItem('viroom/userid')

    this.lastmodel = ''
  },

  remove: function () {
    // Do something the component or its entity is detached.
  },

  tick: function (time, timeDelta) {
    // update all interpolators
    const leftEyebrowValue = this.leftEyebrowLerp.tick(this.data.leftEyebrow)
    const rightEyebrowValue = this.rightEyebrowLerp.tick(this.data.rightEyebrow)
    const rollValue = this.rollLerp.tick(this.data.roll)
    const yawValue = this.yawLerp.tick(this.data.yaw)
    const tiltValue = this.tiltLerp.tick(this.data.tilt)
    const pxValue = this.pxLerp.tick(this.data.position.x)
    const pyValue = this.pyLerp.tick(this.data.position.y)
    const pzValue = this.pzLerp.tick(this.data.position.z)
    const mwValue = this.pzLerp.tick(this.data.mouth.width)
    const mhValue = this.pzLerp.tick(this.data.mouth.height)

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
    console.log(this.data.mood)
    if (headEl) {
      // if (this.data.expressions.smile > 12) {
      //   headEl.setAttribute('color', '#00ff00')
      // } else if (this.data.expressions.smile < 6) {
      //   headEl.setAttribute('color', '#ff0000')
      // } else {
      //   headEl.setAttribute('color', '#F6E05E')
      // }

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
