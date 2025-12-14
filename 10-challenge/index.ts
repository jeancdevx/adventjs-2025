function maxDepth(s: string): number {
  let depth = 0
  let maxD = 0

  for (const char of s) {
    if (char === '[') {
      depth++
      maxD = Math.max(maxD, depth)
    } else if (char === ']') {
      depth--
      if (depth < 0) return -1
    }
  }

  return depth === 0 ? maxD : -1
}
