export const timeout = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const pick = (obj, keys) =>
  keys
    .map((k) => (k in obj ? { [k]: obj[k] } : {}))
    .reduce((res, o) => Object.assign(res, o), {})

export const calculateTilt = ({ annotations }) => {
  const { leftCheek, rightCheek } = annotations
  const dX = rightCheek[0][0] - leftCheek[0][0]
  const dY = rightCheek[0][1] - leftCheek[0][1]

  return Math.atan(dY / dX) * 180 / Math.PI
}

export const calculateEyebrowTilt = (eyebrow) => {
  const dX = eyebrow[7][0] - eyebrow[0][0]
  const dY = eyebrow[7][1] - eyebrow[0][1]

  return Math.atan(dY / dX) * 180 / Math.PI
}

export const calculateExpressions = ({mouth, leftEyebrow, rightEyebrow}) => {

  return {
    smile: (mouth.width * 4) / (mouth.height)
  }

}

export const getPositions = (annotation) => {
  const [x, y, z] = annotation.map((p) => p / 1000)

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
