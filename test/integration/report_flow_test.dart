import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:hive/hive.dart';
import 'package:house_risk_snapshot/core/models/cost_band.dart';
import 'package:house_risk_snapshot/core/models/house_inputs.dart';
import 'package:house_risk_snapshot/core/models/lifecycle_flag.dart';
import 'package:house_risk_snapshot/core/models/report.dart';
import 'package:house_risk_snapshot/core/models/risk_output.dart';
import 'package:house_risk_snapshot/core/services/risk_engine.dart' show RiskEngine, modelVersion;
import 'package:house_risk_snapshot/core/services/storage_service.dart';
import 'package:uuid/uuid.dart';

void main() {
  setUpAll(() async {
    TestWidgetsFlutterBinding.ensureInitialized();
    final tempDir = Directory.systemTemp.createTempSync('hive_integration_');
    Hive.init(tempDir.path);
    Hive.registerAdapter(ReportAdapter());
    Hive.registerAdapter(HouseInputsAdapter());
    Hive.registerAdapter(RiskOutputAdapter());
    Hive.registerAdapter(LifecycleFlagAdapter());
    Hive.registerAdapter(CostBandAdapter());
  });

  tearDownAll(() async {
    await Hive.close();
  });

  test('Report flow: create -> save -> list -> open', () async {
    final storage = StorageService();
    final inputs = HouseInputs(
      byggnadstyp: 'enplanshus',
      byggnadsar: 1990,
      size: 120,
      grundlaeggning: 'betongplatta',
      yttertakType: 'takpapp',
      yttertakAge: 15,
      fasadType: 'tegel',
      fasadAge: 10,
      uppvarmning: 'bergvarme',
      ventilation: 'ftxMekanisk',
    );
    final output = RiskEngine.compute(inputs);
    final report = Report(
      id: const Uuid().v4(),
      houseLabel: 'Test House',
      inputs: inputs,
      outputs: output,
      timestamp: DateTime.now(),
      modelVersion: modelVersion,
    );

    await storage.saveReport(report);

    final list = await storage.listReports();
    expect(list, isNotEmpty);
    expect(list.any((r) => r.id == report.id), isTrue);

    final loaded = await storage.getReport(report.id);
    expect(loaded, isNotNull);
    expect(loaded!.houseLabel, report.houseLabel);
    expect(loaded.outputs.score, report.outputs.score);

    await storage.deleteReport(report.id);
    final afterDelete = await storage.listReports();
    expect(afterDelete.any((r) => r.id == report.id), isFalse);
  });
}
