import 'settings_service.dart';

/// Free: 1 report. Paid (one-time unlock): unlimited reports.
class PurchaseService {
  final SettingsService _settings = SettingsService();

  static const int freeReportLimit = 1;

  Future<bool> get isPurchased async {
    final s = await _settings.getSettings();
    return s.purchased;
  }

  Future<bool> canCreateReport(int currentReportCount) async {
    final s = await _settings.getSettings();
    if (s.purchased) return true;
    if (await _settings.getDevUnlockPurchased()) return true;
    return currentReportCount < freeReportLimit;
  }

  /// For v1: manual unlock. Future: IAP.
  Future<void> unlockPurchased() async {
    final s = await _settings.getSettings();
    await _settings.saveSettings(s.copyWith(purchased: true));
  }
}
