export const getYAlongPath = (
  x: number,
  path: SVGPathElement,
  error = 0.01
) => {
  let lengthEnd = path.getTotalLength()
  let lengthStart = 0
  let point = path.getPointAtLength((lengthEnd + lengthStart) / 2) // get the middle point
  const bisectionIterationsMax = 50
  let bisectionIterations = 0

  while (x < point.x - error || x > point.x + error) {
    // get the middle point
    point = path.getPointAtLength((lengthEnd + lengthStart) / 2)

    if (x < point.x) {
      lengthEnd = (lengthStart + lengthEnd) / 2
    } else {
      lengthStart = (lengthStart + lengthEnd) / 2
    }

    bisectionIterations += 1

    // Increase iteration
    if (bisectionIterationsMax < bisectionIterations) break
  }
  return point.y
}
