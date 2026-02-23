import 'package:hive/hive.dart';

part 'house_inputs.g.dart';

@HiveType(typeId: 4)
class HouseInputs {
  @HiveField(0)
  final String byggnadstyp;

  @HiveField(1)
  final int byggnadsar;

  @HiveField(2)
  final double size;

  @HiveField(3)
  final String grundlaeggning;

  @HiveField(4)
  final String yttertakType;

  @HiveField(5)
  final int yttertakAge;

  @HiveField(6)
  final String fasadType;

  @HiveField(7)
  final int fasadAge;

  @HiveField(8)
  final String uppvarmning;

  @HiveField(9)
  final String ventilation;

  @HiveField(10)
  final String? houseLabel;

  @HiveField(11)
  final String? stomme;

  @HiveField(12)
  final String? siteType;

  @HiveField(13)
  final int? hangrannorAge;

  @HiveField(14)
  final String? fonsterType;

  @HiveField(15)
  final int? fonsterAge;

  @HiveField(16)
  final int? draneringAge;

  @HiveField(17)
  final int? vatrumAge;

  @HiveField(18)
  final bool? skorsten;

  @HiveField(19)
  final int? skorstenSealAge;

  @HiveField(20)
  final int? luftvarmepumpAge;

  const HouseInputs({
    required this.byggnadstyp,
    required this.byggnadsar,
    required this.size,
    required this.grundlaeggning,
    required this.yttertakType,
    required this.yttertakAge,
    required this.fasadType,
    required this.fasadAge,
    required this.uppvarmning,
    required this.ventilation,
    this.houseLabel,
    this.stomme,
    this.siteType,
    this.hangrannorAge,
    this.fonsterType,
    this.fonsterAge,
    this.draneringAge,
    this.vatrumAge,
    this.skorsten,
    this.skorstenSealAge,
    this.luftvarmepumpAge,
  });

  HouseInputs copyWith({
    String? byggnadstyp,
    int? byggnadsar,
    double? size,
    String? grundlaeggning,
    String? yttertakType,
    int? yttertakAge,
    String? fasadType,
    int? fasadAge,
    String? uppvarmning,
    String? ventilation,
    String? houseLabel,
    String? stomme,
    String? siteType,
    int? hangrannorAge,
    String? fonsterType,
    int? fonsterAge,
    int? draneringAge,
    int? vatrumAge,
    bool? skorsten,
    int? skorstenSealAge,
    int? luftvarmepumpAge,
  }) {
    return HouseInputs(
      byggnadstyp: byggnadstyp ?? this.byggnadstyp,
      byggnadsar: byggnadsar ?? this.byggnadsar,
      size: size ?? this.size,
      grundlaeggning: grundlaeggning ?? this.grundlaeggning,
      yttertakType: yttertakType ?? this.yttertakType,
      yttertakAge: yttertakAge ?? this.yttertakAge,
      fasadType: fasadType ?? this.fasadType,
      fasadAge: fasadAge ?? this.fasadAge,
      uppvarmning: uppvarmning ?? this.uppvarmning,
      ventilation: ventilation ?? this.ventilation,
      houseLabel: houseLabel ?? this.houseLabel,
      stomme: stomme ?? this.stomme,
      siteType: siteType ?? this.siteType,
      hangrannorAge: hangrannorAge ?? this.hangrannorAge,
      fonsterType: fonsterType ?? this.fonsterType,
      fonsterAge: fonsterAge ?? this.fonsterAge,
      draneringAge: draneringAge ?? this.draneringAge,
      vatrumAge: vatrumAge ?? this.vatrumAge,
      skorsten: skorsten ?? this.skorsten,
      skorstenSealAge: skorstenSealAge ?? this.skorstenSealAge,
      luftvarmepumpAge: luftvarmepumpAge ?? this.luftvarmepumpAge,
    );
  }
}
