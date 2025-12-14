type Factory = string[]
type Result = 'completed' | 'broken' | 'loop'

function runFactory(factory: Factory): Result {
  const directions: Record<string, [number, number]> = {
    '>': [1, 0],
    '<': [-1, 0],
    '^': [0, -1],
    v: [0, 1],
  }

  const visited = new Set<string>()
  let x = 0,
    y = 0

  while (true) {
    const key = `${x},${y}`

    if (y < 0 || y >= factory.length || x < 0 || x >= factory[y].length) {
      return 'broken'
    }

    const cell = factory[y][x]

    if (cell === '.') return 'completed'
    if (visited.has(key)) return 'loop'

    visited.add(key)

    const [dx, dy] = directions[cell]
    x += dx
    y += dy
  }
}
