// Solucion 1:
function manufactureGifts(
  giftsToProduce: Array<{ toy: string; quantity: number }>
): string[] {
  const manufacturedGifts: string[] = []

  for (const gift of giftsToProduce) {
    for (let i = 0; i < gift.quantity; i++) {
      manufacturedGifts.push(gift.toy)
    }
  }

  return manufacturedGifts
}

// Solucion 2:
// function manufactureGifts(
//   giftsToProduce: Array<{ toy: string; quantity: number }>
// ): string[] {
//   return giftsToProduce
//     .filter(({ quantity }) => typeof quantity === 'number' && quantity > 0)
//     .flatMap(({ toy, quantity }) => Array(quantity).fill(toy))
// }
