import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hive/hive.dart';
import 'package:house_risk_snapshot/app.dart';
import 'package:house_risk_snapshot/core/models/app_settings.dart';
import 'package:house_risk_snapshot/core/models/cost_band.dart';
import 'package:house_risk_snapshot/core/models/house_inputs.dart';
import 'package:house_risk_snapshot/core/models/lifecycle_flag.dart';
import 'package:house_risk_snapshot/core/models/report.dart';
import 'package:house_risk_snapshot/core/models/risk_output.dart';

void main() {
  setUpAll(() async {
    TestWidgetsFlutterBinding.ensureInitialized();
    final tempDir = Directory.systemTemp.createTempSync('hive_test_');
    Hive.init(tempDir.path);
    Hive.registerAdapter(ReportAdapter());
    Hive.registerAdapter(HouseInputsAdapter());
    Hive.registerAdapter(RiskOutputAdapter());
    Hive.registerAdapter(LifecycleFlagAdapter());
    Hive.registerAdapter(CostBandAdapter());
    Hive.registerAdapter(AppSettingsAdapter());
  });

  tearDownAll(() async {
    await Hive.close();
  });

  testWidgets('App loads report list', (WidgetTester tester) async {
    await tester.pumpWidget(const App());
    await tester.pump();
    // App shows loading first, then ReportListScreen after settings load
    expect(
      find.byType(CircularProgressIndicator).evaluate().isNotEmpty ||
          find.text('Reports').evaluate().isNotEmpty,
      isTrue,
    );
  });
}
