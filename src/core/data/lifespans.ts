/** Lifespan values in years. Derived from SBR BILAGA 3. No copyrighted text. */

import type { YttertakType, FasadType } from '../models/types';

export const roofLifespans: Record<YttertakType, number> = {
  takpapp: 20,
  gummiduk: 30,
  betongpannor: 30,
  tegeltak: 30,
  plattak: 35,
  other: 30,
};

/** null = no practical replacement (tegel). Engine skips facade check for null. */
export const fasadLifespans: Record<FasadType, number | null> = {
  tegel: null,
  tra: 40,
  puts: 30,
  blandad: 30,
};

export const drainageLifespan = 25;
export const vatrumLifespan = 20;
