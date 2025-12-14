function findUnsafeGifts(warehouse: string[]): number {
  const directions = [
    [0, -1],
    [0, 1],
    [-1, 0],
    [1, 0],
  ]

  const hasCamera = (x: number, y: number): boolean => {
    return directions.some(([dx, dy]) => {
      const nx = x + dx
      const ny = y + dy
      return (
        ny >= 0 &&
        ny < warehouse.length &&
        nx >= 0 &&
        nx < warehouse[ny].length &&
        warehouse[ny][nx] === '#'
      )
    })
  }

  let unsafeCount = 0

  for (let y = 0; y < warehouse.length; y++) {
    for (let x = 0; x < warehouse[y].length; x++) {
      if (warehouse[y][x] === '*' && !hasCamera(x, y)) {
        unsafeCount++
      }
    }
  }

  return unsafeCount
}
