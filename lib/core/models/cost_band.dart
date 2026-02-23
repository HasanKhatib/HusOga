import 'package:hive/hive.dart';

part 'cost_band.g.dart';

@HiveType(typeId: 1)
class CostBand {
  @HiveField(0)
  final int min;

  @HiveField(1)
  final int likely;

  @HiveField(2)
  final int max;

  const CostBand({
    required this.min,
    required this.likely,
    required this.max,
  });
}
