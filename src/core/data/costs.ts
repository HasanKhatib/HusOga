/** Cost ranges in SEK. Derived from SBR BILAGA 3. No copyrighted text. */

import type { YttertakType, FasadType } from '../models/types';

/** [min, max] SEK for full roof replacement */
export const roofCosts: Record<YttertakType, [number, number]> = {
  takpapp: [80_000, 150_000],
  gummiduk: [100_000, 200_000],
  betongpannor: [150_000, 300_000],
  tegeltak: [150_000, 300_000],
  plattak: [100_000, 250_000],
  other: [100_000, 250_000],
};

/** Cost per m² SEK for facade painting / refurbishment (tegel = 0) */
export const fasadCostPerSqm: Record<FasadType, number> = {
  tegel: 0,
  tra: 800,
  puts: 2500,
  blandad: 1500,
};

/** Drainage total villa cost range SEK (approx 100 m²) */
export const drainageCost: [number, number] = [130_000, 200_000];

/** Wet room renovation cost range SEK */
export const vatrumCost: [number, number] = [50_000, 150_000];
