import 'package:hive/hive.dart';

import 'house_inputs.dart';
import 'risk_output.dart';

part 'report.g.dart';

@HiveType(typeId: 0)
class Report {
  @HiveField(0)
  final String id;

  @HiveField(1)
  final String houseLabel;

  @HiveField(2)
  final HouseInputs inputs;

  @HiveField(3)
  final RiskOutput outputs;

  @HiveField(4)
  final DateTime timestamp;

  @HiveField(5)
  final String modelVersion;

  const Report({
    required this.id,
    required this.houseLabel,
    required this.inputs,
    required this.outputs,
    required this.timestamp,
    required this.modelVersion,
  });

  Report copyWith({
    String? id,
    String? houseLabel,
    HouseInputs? inputs,
    RiskOutput? outputs,
    DateTime? timestamp,
    String? modelVersion,
  }) {
    return Report(
      id: id ?? this.id,
      houseLabel: houseLabel ?? this.houseLabel,
      inputs: inputs ?? this.inputs,
      outputs: outputs ?? this.outputs,
      timestamp: timestamp ?? this.timestamp,
      modelVersion: modelVersion ?? this.modelVersion,
    );
  }
}
