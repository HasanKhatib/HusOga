import 'package:flutter/material.dart';
import 'package:hive_flutter/hive_flutter.dart';

import 'app.dart';
import 'core/models/app_settings.dart';
import 'core/models/cost_band.dart';
import 'core/models/house_inputs.dart';
import 'core/models/lifecycle_flag.dart';
import 'core/models/report.dart';
import 'core/models/risk_output.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Hive.initFlutter();
  Hive.registerAdapter(ReportAdapter());
  Hive.registerAdapter(HouseInputsAdapter());
  Hive.registerAdapter(RiskOutputAdapter());
  Hive.registerAdapter(LifecycleFlagAdapter());
  Hive.registerAdapter(CostBandAdapter());
  Hive.registerAdapter(AppSettingsAdapter());

  runApp(const App());
}
