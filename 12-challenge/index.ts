function elfBattle(elf1: string, elf2: string): number {
  const damage: Record<string, number> = { F: 2, A: 1 }

  const calcDamage = (atk: string, def: string): number =>
    damage[atk] ? (atk === 'A' && def === 'B' ? 0 : damage[atk]) : 0

  let hp1 = 3,
    hp2 = 3

  for (
    let i = 0;
    i < Math.max(elf1.length, elf2.length) && hp1 > 0 && hp2 > 0;
    i++
  ) {
    hp1 -= calcDamage(elf2[i] ?? '', elf1[i] ?? '')
    hp2 -= calcDamage(elf1[i] ?? '', elf2[i] ?? '')
  }

  return hp1 === hp2 ? 0 : hp1 > hp2 ? 1 : 2
}
