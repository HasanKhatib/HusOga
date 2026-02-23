import 'package:hive_flutter/hive_flutter.dart';

import '../models/report.dart';

const _reportsBoxName = 'reports';

/// Hive CRUD for reports.
class StorageService {
  Box<Report>? _box;

  Future<Box<Report>> _getBox() async {
    _box ??= await Hive.openBox<Report>(_reportsBoxName);
    return _box!;
  }

  Future<void> saveReport(Report report) async {
    final box = await _getBox();
    await box.put(report.id, report);
  }

  Future<Report?> getReport(String id) async {
    final box = await _getBox();
    return box.get(id);
  }

  Future<List<Report>> listReports() async {
    final box = await _getBox();
    final list = box.values.toList();
    list.sort((a, b) => b.timestamp.compareTo(a.timestamp));
    return list;
  }

  Future<void> deleteReport(String id) async {
    final box = await _getBox();
    await box.delete(id);
  }
}
