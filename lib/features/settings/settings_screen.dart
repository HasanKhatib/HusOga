import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import '../../core/models/app_settings.dart';
import '../../core/services/settings_service.dart';
import '../../l10n/app_localizations.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({
    super.key,
    required this.settings,
    required this.onSettingsChanged,
  });

  final AppSettings settings;
  final ValueChanged<AppSettings> onSettingsChanged;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(title: Text(l10n.settings)),
      body: ListView(
        children: [
          ListTile(
            title: Text(l10n.language),
            subtitle: Text(
              settings.locale == 'sv' ? l10n.swedish : l10n.english,
            ),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => _showLanguagePicker(context),
          ),
          if (kDebugMode) const _DevUnlockTile(),
        ],
      ),
    );
  }

  void _showLanguagePicker(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    showModalBottomSheet(
      context: context,
      builder: (ctx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              title: Text(l10n.english),
              onTap: () {
                _setLocale(ctx, 'en');
                Navigator.pop(ctx);
              },
            ),
            ListTile(
              title: Text(l10n.swedish),
              onTap: () {
                _setLocale(ctx, 'sv');
                Navigator.pop(ctx);
              },
            ),
          ],
        ),
      ),
    );
  }

  void _setLocale(BuildContext context, String locale) async {
    final updated = settings.copyWith(locale: locale);
    await SettingsService().saveSettings(updated);
    onSettingsChanged(updated);
  }

}

class _DevUnlockTile extends StatefulWidget {
  const _DevUnlockTile();

  @override
  State<_DevUnlockTile> createState() => _DevUnlockTileState();
}

class _DevUnlockTileState extends State<_DevUnlockTile> {
  bool _value = false;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final v = await SettingsService().getDevUnlockPurchased();
    if (mounted) setState(() {
      _value = v;
      _loading = false;
    });
  }

  Future<void> _onChanged(bool value) async {
    await SettingsService().setDevUnlockPurchased(value);
    if (mounted) setState(() => _value = value);
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    if (_loading) return const ListTile(title: Text('...'));
    return SwitchListTile(
      title: Text(l10n.devUnlockPurchased),
      value: _value,
      onChanged: _onChanged,
    );
  }
}
