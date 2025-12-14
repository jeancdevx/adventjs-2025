type Gift = string | number | boolean
type Workshop = Record<string, any>
type Path = string[]

function findGiftPath(workshop: Workshop, gift: Gift): Path {
  for (const key of Object.keys(workshop)) {
    const value = workshop[key]

    if (value === gift) return [key]

    if (typeof value === 'object' && value !== null) {
      const path = findGiftPath(value, gift)
      if (path.length > 0) return [key, ...path]
    }
  }

  return []
}
