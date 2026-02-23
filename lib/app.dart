import 'package:flutter/material.dart';

import 'core/models/app_settings.dart';
import 'core/services/settings_service.dart';
import 'features/reports/report_list_screen.dart';
import 'features/settings/settings_screen.dart';
import 'l10n/app_localizations.dart';

class App extends StatefulWidget {
  const App({super.key});

  @override
  State<App> createState() => _AppState();
}

class _AppState extends State<App> {
  AppSettings _settings = const AppSettings();
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    final s = await SettingsService().getSettings();
    if (mounted) {
      setState(() {
        _settings = s;
        _loading = false;
      });
    }
  }

  void _onSettingsChanged(AppSettings s) {
    setState(() => _settings = s);
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return MaterialApp(
        home: Scaffold(
          body: Center(child: const CircularProgressIndicator()),
        ),
      );
    }
    return MaterialApp(
      title: 'House Risk Snapshot',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      localizationsDelegates: AppLocalizations.localizationsDelegates,
      supportedLocales: AppLocalizations.supportedLocales,
      locale: Locale(_settings.locale),
      home: ReportListScreen(
        onOpenSettings: () => Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => SettingsScreen(
              settings: _settings,
              onSettingsChanged: _onSettingsChanged,
            ),
          ),
        ),
      ),
    );
  }
}
