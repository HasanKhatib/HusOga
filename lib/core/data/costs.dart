/// Derived cost ranges (SEK) for component replacement.
/// Informed by SBR BILAGA 3; see sources.md. No copyrighted text.
library;

/// Roof type cost range [min, max] SEK.
const Map<String, (int, int)> roofCosts = {
  'takpapp': (80000, 150000),
  'gummiduk': (100000, 200000),
  'betongpannor': (150000, 300000),
  'tegeltak': (150000, 300000),
  'plattak': (100000, 250000),
  'other': (100000, 250000),
};

/// Gutters cost range SEK.
const (int, int) guttersCost = (15000, 40000);

/// Facade cost per m2 (painting/refurb) for trä/puts; tegel = 0.
const Map<String, int> fasadCostPerSqm = {
  'tegel': 0,
  'tra': 800,
  'puts': 2500,
  'blandad': 1500,
};

/// Drainage total villa cost range SEK (approx 100 m2).
const (int, int) drainageCost = (130000, 200000);

/// Wet room renovation cost range SEK.
const (int, int) vatrumCost = (50000, 150000);

/// Chimney seal cost per meter SEK.
const int chimneySealCostPerM = 1400;
