import 'package:hive/hive.dart';

import 'cost_band.dart';
import 'lifecycle_flag.dart';

part 'risk_output.g.dart';

@HiveType(typeId: 3)
class RiskOutput {
  @HiveField(0)
  final int score;

  @HiveField(1)
  final String scoreBand;

  @HiveField(2)
  final List<LifecycleFlag> lifecycleFlags;

  @HiveField(3)
  final CostBand costBand;

  @HiveField(4)
  final List<String> negotiationChecklist;

  const RiskOutput({
    required this.score,
    required this.scoreBand,
    required this.lifecycleFlags,
    required this.costBand,
    required this.negotiationChecklist,
  });
}
