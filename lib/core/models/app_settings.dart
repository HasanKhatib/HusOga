import 'package:hive/hive.dart';

part 'app_settings.g.dart';

@HiveType(typeId: 5)
class AppSettings {
  @HiveField(0)
  final String locale;

  @HiveField(1)
  final bool purchased;

  const AppSettings({
    this.locale = 'sv',
    this.purchased = false,
  });

  AppSettings copyWith({String? locale, bool? purchased}) {
    return AppSettings(
      locale: locale ?? this.locale,
      purchased: purchased ?? this.purchased,
    );
  }
}
