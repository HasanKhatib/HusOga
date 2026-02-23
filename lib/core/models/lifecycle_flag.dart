import 'package:hive/hive.dart';

part 'lifecycle_flag.g.dart';

@HiveType(typeId: 2)
class LifecycleFlag {
  @HiveField(0)
  final String component;

  @HiveField(1)
  final String level;

  @HiveField(2)
  final List<String> triggeredBy;

  @HiveField(3)
  final int contributionPercent;

  @HiveField(4)
  final String messageKey;

  const LifecycleFlag({
    required this.component,
    required this.level,
    required this.triggeredBy,
    required this.contributionPercent,
    required this.messageKey,
  });
}
