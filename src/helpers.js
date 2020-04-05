export const timeout = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const pick = (obj, keys) =>
  keys
    .map((k) => (k in obj ? { [k]: obj[k] } : {}))
    .reduce((res, o) => Object.assign(res, o), {})

export const calculateYaw = ({ annotations }) => {
  const { noseTip, noseBottom } = annotations
  const dX = noseBottom[0][2] - noseTip[0][2]
  const dY = noseBottom[0][1] - noseTip[0][1]

  return Math.atan2(dY, dX) * 360 / Math.PI - 90
}

export const calculateRoll = ({ annotations }) => {
  const { leftCheek, rightCheek } = annotations
  const dX = rightCheek[0][0] - leftCheek[0][0]
  const dY = rightCheek[0][1] - leftCheek[0][1]

  return Math.atan2(-dY, -dX) * 360 / Math.PI
}

export const calculateTilt = ({ annotations }) => {
  const { leftCheek, rightCheek } = annotations
  const dX = rightCheek[0][0] - leftCheek[0][0]
  const dY = rightCheek[0][2] - leftCheek[0][2]

  return Math.atan2(-dY, -dX) * 360 / Math.PI
}

export const calculateEyebrowTilt = (eyebrow) => {
  const dX = eyebrow[7][0] - eyebrow[0][0]
  const dY = eyebrow[7][1] - eyebrow[0][1]

  return Math.atan2(-dY, -dX) * 360 / Math.PI
}

export const calculateExpressions = ({mouth, leftEyebrow, rightEyebrow}) => {

  return {
    smile: (mouth.width * 4) / (mouth.height)
  }

}

export const getPositions = (annotation) => {
  const [x, y, z] = annotation.map((p) => p / 100)

  return { x: -x, y: -y, z }
}

export const averagePosition = (positions) => {
  let x=0, y=0, z=0

  positions.map(p => {
    x += p[0]
    y += p[1]
    z += p[2]
  })

  x /= positions.length
  y /= positions.length
  z /= positions.length

  return { x: -x, y: -y, z }
}

export const getPositionArray = ({x, y, z}) => [-x*10, -y*10, z*10]

export const midpoint = (pointA, pointB) => ({
  x: (pointA.x + pointB.x) / 2,
  y: (pointA.y + pointB.y) / 2,
  z: (pointA.z + pointB.z) / 2,
})

export const diff = (pointA, pointB) => ({
  x: pointA.x - pointB.x,
  y: pointA.y - pointB.y,
  z: pointA.z - pointB.z,
})

export const dist = (pointA, pointB) => {
  const d = diff(pointA, pointB);
  return Math.sqrt(d.x*d.x + d.y*d.y + d.z*d.z);
}

export const lerpclamp = (x, x0, x1, y0, y1) => {
  var t = (x-x0) / (x1 - x0);
  if (t < 0) t = 0;
  if (t > 1) t = 1;
  t = y0 + (t * (y1 - y0));
  return t;
}