function drawGift(size: number, symbol: string): string {
  if (size < 2) return ''

  const fullRow = symbol.repeat(size)
  const middleRow = `${symbol}${' '.repeat(size - 2)}${symbol}`

  return Array.from({ length: size }, (_, i) =>
    i === 0 || i === size - 1 ? fullRow : middleRow
  ).join('\n')
}
