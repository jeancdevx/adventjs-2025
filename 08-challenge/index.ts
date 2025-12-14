function findUniqueToy(toy: string): string {
  const frequency = new Map<string, number>()

  for (const char of toy) {
    const lower = char.toLowerCase()
    frequency.set(lower, (frequency.get(lower) || 0) + 1)
  }

  for (const char of toy) {
    if (frequency.get(char.toLowerCase()) === 1) {
      return char
    }
  }

  return ''
}
