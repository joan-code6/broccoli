export const K = 1.5
export const MIN_SCALE = 0.3
export const MAX_SCALE = 2.5

export function computeScale(score: number): number {
  const expVal = Math.exp(K * score / 250)
  const expMax = Math.exp(K)
  return MIN_SCALE + (MAX_SCALE - MIN_SCALE) * (expVal - 1) / (expMax - 1)
}
