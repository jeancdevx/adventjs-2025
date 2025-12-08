type Glove = { hand: 'L' | 'R'; color: string }

function matchGloves(gloves: Glove[]): string[] {
  const leftGloves = new Map<string, number>()
  const rightGloves = new Map<string, number>()
  const pairs: string[] = []
  
  for (const glove of gloves) {
    const { hand, color } = glove
    
    if (hand === 'L') {
      const rightCount = rightGloves.get(color) || 0
      if (rightCount > 0) {
        pairs.push(color)
        rightGloves.set(color, rightCount - 1)
      } else {
        leftGloves.set(color, (leftGloves.get(color) || 0) + 1)
      }
    } else {
      const leftCount = leftGloves.get(color) || 0
      if (leftCount > 0) {
        pairs.push(color)
        leftGloves.set(color, leftCount - 1)
      } else {
        rightGloves.set(color, (rightGloves.get(color) || 0) + 1)
      }
    }
  }
  
  return pairs
}
