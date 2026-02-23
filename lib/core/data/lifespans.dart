/// Derived lifespan values (years) for building components.
/// Informed by SBR BILAGA 3; see sources.md. No copyrighted text.
library;

/// Roof type lifespan in years.
const Map<String, int> roofLifespans = {
  'takpapp': 20,
  'gummiduk': 30,
  'betongpannor': 30,
  'tegeltak': 30,
  'plattak': 35,
  'other': 30,
};

/// Gutters lifespan in years.
const int guttersLifespan = 25;

/// Facade type lifespan in years (tegel = no replacement).
const Map<String, int?> fasadLifespans = {
  'tegel': null, // no replacement
  'tra': 40,
  'puts': 30,
  'blandad': 30,
};

/// Window type lifespan in years.
const Map<String, int> fonsterLifespans = {
  'twoGlas': 25,
  'threeGlas': 25,
  'isolerglas': 25,
};

/// Drainage lifespan in years.
const int drainageLifespan = 25;

/// Wet room (vattrum) lifespan in years.
const int vatrumLifespan = 20;

/// Chimney seal lifespan in years.
const int chimneySealLifespan = 40;

/// Heat pump lifespan in years.
const int heatPumpLifespan = 8;
