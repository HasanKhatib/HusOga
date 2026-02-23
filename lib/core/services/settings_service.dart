import 'dart:ui' as ui;

import 'package:hive_flutter/hive_flutter.dart';

import '../models/app_settings.dart';

const _settingsBoxName = 'app_settings';

/// Persists and loads AppSettings (locale, purchased).
class SettingsService {
  Box<AppSettings>? _box;

  Future<Box<AppSettings>> _getBox() async {
    _box ??= await Hive.openBox<AppSettings>(_settingsBoxName);
    return _box!;
  }

  Future<AppSettings> getSettings() async {
    final box = await _getBox();
    final stored = box.get('settings');
    if (stored != null) return stored;
    return AppSettings(
      locale: resolveLocale(ui.PlatformDispatcher.instance.locale),
    );
  }

  Future<void> saveSettings(AppSettings settings) async {
    final box = await _getBox();
    await box.put('settings', settings);
  }

  /// Resolve locale: device if en/sv, else fallback to sv.
  static String resolveLocale(ui.Locale? deviceLocale) {
    final code = deviceLocale?.languageCode ?? 'sv';
    if (code == 'en' || code == 'sv') return code;
    return 'sv';
  }
}
