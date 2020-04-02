const timeout = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const pick = (obj, keys) =>
  keys
    .map((k) => (k in obj ? { [k]: obj[k] } : {}))
    .reduce((res, o) => Object.assign(res, o), {})

export const calculateTilt = ({ annotations }) => {
  const dX = annotations.rightCheek[0][0] - annotations.leftCheek[0][0]
  const dY = annotations.rightCheek[0][1] - annotations.leftCheek[0][1]
  // const dZ = annotations.rightCheek[0][2] - annotations.leftCheek[0][2]
  const degree = Math.atan(dY / dX) * 180

  return degree
}

export const getPositions = (annotation) => {
  const [x, y, z] = annotation.map((p) => p / 1000)

  return { x, y: -y, z }
}

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
