type Board = string
type Moves = string
type Result = 'fail' | 'crash' | 'success'

function moveReno(board: Board, moves: Moves): Result {
  const rows = board.split('\n').filter((row) => row.length > 0)
  const grid = rows.map((row) => row.split(''))

  const findReno = (): [number, number] => {
    for (let i = 0; i < grid.length; i++) {
      const j = grid[i].indexOf('@')
      if (j !== -1) return [j, i]
    }
    return [0, 0]
  }

  const isCollision = (x: number, y: number): boolean =>
    y < 0 ||
    y >= grid.length ||
    x < 0 ||
    x >= grid[y].length ||
    grid[y][x] === '#'

  const isItem = (x: number, y: number): boolean => grid[y][x] === '*'

  const directions: Record<string, [number, number]> = {
    L: [-1, 0],
    R: [1, 0],
    U: [0, -1],
    D: [0, 1],
  }

  let [x, y] = findReno()
  let collected = false

  for (const move of moves) {
    const [dx, dy] = directions[move]
    x += dx
    y += dy

    if (isCollision(x, y)) return collected ? 'success' : 'crash'
    if (isItem(x, y)) collected = true
  }

  return collected ? 'success' : 'fail'
}
