import KalmanFilter from 'kalmanjs'

AFRAME.registerComponent('face', {
  schema: {
    userId: { type: 'string' },
    dummy: { type: 'number' },
    position: { type: 'vec3' },
    leftCheek: { type: 'vec3' },
    rightCheek: { type: 'vec3' },
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

    // Wait for model to load.
    this.el.addEventListener('model-loaded', () => {
      // Grab the mesh / scene.
      const obj = this.el.object3D
      // Go over the submeshes and modify materials we want.
      this.bones = {}
      obj.traverse(node => {
        if (node.type === 'Bone') this.bones[node.name.toLowerCase()] = node
      });
    });

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
    if (!this.bones) return

    // annotations: 
    // silhouette. lipsUpperOuter. lipsLowerOuter. lipsUpperInner. lipsLowerInner. rightEyeUpper0. 
    // rightEyeLower0. rightEyeUpper1. rightEyeLower1. rightEyeUpper2. rightEyeLower2. rightEyeLower3. 
    // rightEyebrowUpper. rightEyebrowLower. leftEyeUpper0. leftEyeLower0. leftEyeUpper1. leftEyeLower1. 
    // leftEyeUpper2. leftEyeLower2. leftEyeLower3. leftEyebrowUpper. leftEyebrowLower. midwayBetweenEyes. 
    // noseTip. noseBottom. noseRightCorner. noseLeftCorner. rightCheek leftCheek

    // bones:
    // neck, head, eb-raisedl, eb-cornerl, eb-lastl, el-upperl, el-lowerl, nosel, lipl, disgustl, 
    // chin, cheekl, mouth-o, mouth-ee, mouth-f, mouth-m, mouth-u, eyeballl, eb-raisedr, eb-cornerr, 
    // eb-lastr, el-upperr, el-lowerr, noser, lipr, disgustr, cheekr, eyeballr, 
    // eyecontrol, eye-trackl, eye-trackr

    

    // update all interpolators
    const leftEyebrowValue = this.leftEyebrowLerp.filter(this.data.leftEyebrow)
    const rightEyebrowValue = this.rightEyebrowLerp.filter(
      this.data.rightEyebrow
    )
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
      // leftEyebrowEl.object3D.position.y = leftEyebrowValue * 1.75
      leftEyebrowEl.object3D.position.y = leftEyebrowValue * 0.75 + 0.45
      leftEyebrowEl.object3D.setRotationFromEuler(
        new THREE.Euler(
          THREE.Math.degToRad(yawValue),
          THREE.Math.degToRad(),
          THREE.Math.degToRad(rollValue),
          'ZYX'
        )
      )
    }

    const rightEyebrowEl = this.el.getElementsByClassName('rightEyebrow')[0]

    if (rightEyebrowEl) {
      rightEyebrowEl.object3D.position.y = rightEyebrowValue * 0.75 + 0.45
      rightEyebrowEl.object3D.setRotationFromEuler(
        new THREE.Euler(
          THREE.Math.degToRad(yawValue),
          THREE.Math.degToRad(),
          THREE.Math.degToRad(rollValue),
          'ZYX'
        )
      )
    }

    this.bones.neck.position.x = pxValue * 0.1
    this.bones.neck.position.y = pyValue * 0.1 + 0.6
    this.bones.neck.position.z = pzValue * 0.1

    this.bones.cheekl.position.set(this.data.leftCheek.x, this.data.leftCheek.y, this.data.leftCheek.z)
    this.bones.cheekr.position.set(this.data.rightCheek.x, this.data.rightCheek.y, this.data.rightCheek.z)


    this.bones.head.setRotationFromEuler(
      new THREE.Euler(
        -THREE.Math.degToRad(30 + yawValue),
        -THREE.Math.degToRad(tiltValue * 1.75),
        -THREE.Math.degToRad(rollValue),
        'ZYX'
      )
    )

    const markerEl = this.el.getElementsByClassName('themarker')[0]

    if (this.isCurrentUser && markerEl) {
      markerEl.setAttribute('visible', 'true')
    }

  },
})
