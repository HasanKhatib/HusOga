import '../data/costs.dart';
import '../data/lifespans.dart';
import '../models/cost_band.dart';
import '../models/house_inputs.dart';
import '../models/lifecycle_flag.dart';
import '../models/risk_output.dart';
import '../models/score_band.dart';

const String modelVersion = '1.0.0';

/// Risk engine: computes score, flags, cost band, checklist from HouseInputs.
/// Logic derived from SBR BILAGA 3; see sources.md.
class RiskEngine {
  static const double _riskThreshold = 0.7;
  static const double _highRiskThreshold = 0.9;

  static RiskOutput compute(HouseInputs inputs) {
    final flags = <LifecycleFlag>[];
    var totalScore = 0;
    final costMin = <int>[];
    final costLikely = <int>[];
    final costMax = <int>[];

    // Roof
    final roofLifespan =
        roofLifespans[inputs.yttertakType] ?? roofLifespans['other']!;
    final roofRatio = inputs.yttertakAge / roofLifespan;
    if (roofRatio >= _highRiskThreshold) {
      flags.add(LifecycleFlag(
        component: 'roof',
        level: 'highRisk',
        triggeredBy: ['yttertakType', 'yttertakAge'],
        contributionPercent: 25,
        messageKey: 'roofHighRisk',
      ));
      totalScore += 25;
      final c = roofCosts[inputs.yttertakType] ?? (100000, 250000);
      costMin.add(c.$1);
      costLikely.add((c.$1 + c.$2) ~/ 2);
      costMax.add(c.$2);
    } else if (roofRatio >= _riskThreshold) {
      flags.add(LifecycleFlag(
        component: 'roof',
        level: 'risk',
        triggeredBy: ['yttertakType', 'yttertakAge'],
        contributionPercent: 15,
        messageKey: 'roofRisk',
      ));
      totalScore += 15;
      final c = roofCosts[inputs.yttertakType] ?? (100000, 250000);
      costMin.add(c.$1);
      costLikely.add((c.$1 + c.$2) ~/ 2);
      costMax.add(c.$2);
    }

    // Facade
    final fasadLifespan = fasadLifespans[inputs.fasadType];
    if (fasadLifespan != null) {
      final ratio = inputs.fasadAge / fasadLifespan;
      if (ratio >= _highRiskThreshold) {
        flags.add(LifecycleFlag(
          component: 'facade',
          level: 'highRisk',
          triggeredBy: ['fasadType', 'fasadAge'],
          contributionPercent: 20,
          messageKey: 'facadeHighRisk',
        ));
        totalScore += 20;
        final cp = fasadCostPerSqm[inputs.fasadType] ?? 1500;
        if (cp > 0) {
          final cost = (inputs.size * cp).round();
          costMin.add((cost * 0.8).round());
          costLikely.add(cost);
          costMax.add((cost * 1.2).round());
        }
      } else if (ratio >= _riskThreshold) {
        flags.add(LifecycleFlag(
          component: 'facade',
          level: 'risk',
          triggeredBy: ['fasadType', 'fasadAge'],
          contributionPercent: 12,
          messageKey: 'facadeRisk',
        ));
        totalScore += 12;
        final cp = fasadCostPerSqm[inputs.fasadType] ?? 1500;
        if (cp > 0) {
          final cost = (inputs.size * cp).round();
          costMin.add((cost * 0.8).round());
          costLikely.add(cost);
          costMax.add((cost * 1.2).round());
        }
      }
    }

    // Drainage (optional)
    if (inputs.draneringAge != null) {
      final ratio = inputs.draneringAge! / drainageLifespan;
      if (ratio >= _highRiskThreshold) {
        flags.add(LifecycleFlag(
          component: 'drainage',
          level: 'highRisk',
          triggeredBy: ['draneringAge'],
          contributionPercent: 15,
          messageKey: 'drainageHighRisk',
        ));
        totalScore += 15;
        costMin.add(drainageCost.$1);
        costLikely.add((drainageCost.$1 + drainageCost.$2) ~/ 2);
        costMax.add(drainageCost.$2);
      } else if (ratio >= _riskThreshold) {
        flags.add(LifecycleFlag(
          component: 'drainage',
          level: 'risk',
          triggeredBy: ['draneringAge'],
          contributionPercent: 8,
          messageKey: 'drainageRisk',
        ));
        totalScore += 8;
        costMin.add(drainageCost.$1);
        costLikely.add((drainageCost.$1 + drainageCost.$2) ~/ 2);
        costMax.add(drainageCost.$2);
      }
    }

    // Ventilation (weak types = risk)
    if (inputs.ventilation == 'sjalvdrag') {
      flags.add(LifecycleFlag(
        component: 'ventilation',
        level: 'risk',
        triggeredBy: ['ventilation'],
        contributionPercent: 10,
        messageKey: 'ventilationRisk',
      ));
      totalScore += 10;
    }

    // Heating
    if (inputs.uppvarmning == 'direktverkandeEl') {
      flags.add(LifecycleFlag(
        component: 'heating',
        level: 'risk',
        triggeredBy: ['uppvarmning'],
        contributionPercent: 8,
        messageKey: 'heatingRisk',
      ));
      totalScore += 8;
    }

    // Wet rooms (optional)
    if (inputs.vatrumAge != null) {
      final ratio = inputs.vatrumAge! / vatrumLifespan;
      if (ratio >= _highRiskThreshold) {
        flags.add(LifecycleFlag(
          component: 'wetRooms',
          level: 'highRisk',
          triggeredBy: ['vatrumAge'],
          contributionPercent: 12,
          messageKey: 'wetRoomsHighRisk',
        ));
        totalScore += 12;
        costMin.add(vatrumCost.$1);
        costLikely.add((vatrumCost.$1 + vatrumCost.$2) ~/ 2);
        costMax.add(vatrumCost.$2);
      } else if (ratio >= _riskThreshold) {
        flags.add(LifecycleFlag(
          component: 'wetRooms',
          level: 'risk',
          triggeredBy: ['vatrumAge'],
          contributionPercent: 6,
          messageKey: 'wetRoomsRisk',
        ));
        totalScore += 6;
        costMin.add(vatrumCost.$1);
        costLikely.add((vatrumCost.$1 + vatrumCost.$2) ~/ 2);
        costMax.add(vatrumCost.$2);
      }
    }

    // Suterrang/betongplatta 70s auto-flag
    if (inputs.byggnadsar >= 1965 &&
        inputs.byggnadsar <= 1985 &&
        inputs.grundlaeggning == 'betongplatta') {
      final existing = flags.any((f) => f.component == 'drainage');
      if (!existing) {
        flags.add(LifecycleFlag(
          component: 'drainage',
          level: 'risk',
          triggeredBy: ['byggnadsar', 'grundlaeggning'],
          contributionPercent: 10,
          messageKey: 'betongplatta70s',
        ));
        totalScore += 10;
        costMin.add(drainageCost.$1);
        costLikely.add((drainageCost.$1 + drainageCost.$2) ~/ 2);
        costMax.add(drainageCost.$2);
      }
    }

    final score = totalScore.clamp(0, 100);
    final band = _scoreToBand(score);
    final minC = costMin.isEmpty ? 0 : costMin.reduce((a, b) => a + b);
    final likelyC =
        costLikely.isEmpty ? 0 : costLikely.reduce((a, b) => a + b);
    final maxC = costMax.isEmpty ? 0 : costMax.reduce((a, b) => a + b);
    final checklist = _buildChecklist(flags);

    return RiskOutput(
      score: score,
      scoreBand: band.name,
      lifecycleFlags: flags,
      costBand: CostBand(min: minC, likely: likelyC, max: maxC),
      negotiationChecklist: checklist,
    );
  }

  static ScoreBand _scoreToBand(int score) {
    if (score < 30) return ScoreBand.low;
    if (score < 60) return ScoreBand.medium;
    return ScoreBand.high;
  }

  static List<String> _buildChecklist(List<LifecycleFlag> flags) {
    final items = <String>[
      'askSellerRoofFacadeDrainage',
      'demandBuyerInspection',
    ];
    if (flags.any((f) => f.component == 'drainage')) {
      items.add('betongplatta70sCheck');
    }
    if (flags.any((f) => f.component == 'wetRooms')) {
      items.add('vatrumCheck');
    }
    if (flags.any((f) => f.component == 'roof')) {
      items.add('roofSnowCheck');
    }
    return items;
  }
}
