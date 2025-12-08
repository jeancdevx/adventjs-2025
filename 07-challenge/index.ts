function drawTree(height: number, ornament: string, frequency: number): string {
  const lines: string[] = []
  let position = 0
  
  for (let row = 0; row < height; row++) {
    const width = 2 * row + 1
    const spaces = height - row - 1
    let line = ''
    
    for (let i = 0; i < width; i++) {
      position++
      if (position % frequency === 0) {
        line += ornament
      } else {
        line += '*'
      }
    }
    
    lines.push(' '.repeat(spaces) + line)
  }
  
  lines.push(' '.repeat(height - 1) + '#')
  
  return lines.join('\n')
}