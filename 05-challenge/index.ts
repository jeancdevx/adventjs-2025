type ElfDateTime =
  `${number}*${number}*${number}@${number}|${number}|$
  {number} NP`

function timeUntilTakeOff(
  fromTime: ElfDateTime,
  takeOffTime: ElfDateTime
): number {
  const parseElfDateTime = (elfTime: ElfDateTime): Date => {
    const cleaned = elfTime.replace(' NP', '')
    const [datePart, timePart] = cleaned.split('@')
    const [year, month, day] = datePart.split('*').map(Number)
    const [hours, minutes, seconds] = timePart.split('|').map(Number)
    
    return new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds))
  }
  
  const from = parseElfDateTime(fromTime)
  const takeOff = parseElfDateTime(takeOffTime)
  
  const diffInSeconds = Math.floor((takeOff.getTime() - from.getTime()) / 1000)
  
  return diffInSeconds
}
