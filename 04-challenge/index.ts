function decodeSantaPin(code: string): string | null {
  const blocks = code.match(/\[([^\]]+)\]/g)
  
  if (!blocks) return null
  
  const digits: number[] = []
  
  for (const block of blocks) {
    const content = block.slice(1, -1)
    
    if (content === '<') {
      if (digits.length === 0) return null
      digits.push(digits[digits.length - 1])
      continue
    }
    
    if (content.length === 0) return null
    
    const initialDigit = parseInt(content[0])
    if (isNaN(initialDigit)) return null
    
    let result = initialDigit
    
    for (const op of content.slice(1)) {
      if (op === '+') {
        result = (result + 1) % 10
      } else if (op === '-') {
        result = (result - 1 + 10) % 10
      }
    }
    
    digits.push(result)
  }
  
  if (digits.length !== 4) return null
  
  return digits.join('')
}
