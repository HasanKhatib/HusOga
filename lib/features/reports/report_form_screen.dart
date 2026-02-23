import 'dart:async';

import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';

import '../../core/models/house_inputs.dart';
import '../../core/models/report.dart';
import '../../core/services/risk_engine.dart' show RiskEngine, modelVersion;
import '../../core/services/storage_service.dart';
import '../../core/validation.dart';
import '../../shared/widgets/input_form/byggnadstyp_field.dart';
import '../../shared/widgets/input_form/fasad_fields.dart';
import '../../shared/widgets/input_form/grundlaeggning_field.dart';
import '../../shared/widgets/input_form/numeric_fields.dart';
import '../../shared/widgets/input_form/uppvarmning_field.dart';
import '../../shared/widgets/input_form/ventilation_field.dart';
import '../../shared/widgets/input_form/yttertak_fields.dart';
import '../../l10n/app_localizations.dart';
import 'report_result_screen.dart';

class ReportFormScreen extends StatefulWidget {
  const ReportFormScreen({super.key, this.reportId});

  final String? reportId;

  @override
  State<ReportFormScreen> createState() => _ReportFormScreenState();
}

class _ReportFormScreenState extends State<ReportFormScreen> {
  String _byggnadstyp = 'enplanshus';
  int? _byggnadsar;
  double? _size;
  String _grundlaeggning = 'betongplatta';
  String _yttertakType = 'betongpannor';
  int? _yttertakAge;
  String _fasadType = 'tegel';
  int? _fasadAge;
  String _uppvarmning = 'bergvarme';
  String _ventilation = 'ftxMekanisk';
  final Map<String, String> _errors = {};
  final StorageService _storage = StorageService();
  final _uuid = const Uuid();
  Report? _existingReport;
  Timer? _debounceTimer;

  @override
  void dispose() {
    _debounceTimer?.cancel();
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    if (widget.reportId != null) _loadReport();
  }

  Future<void> _loadReport() async {
    final r = await _storage.getReport(widget.reportId!);
    if (r != null && mounted) {
      setState(() {
        _existingReport = r;
        final i = r.inputs;
        _byggnadstyp = i.byggnadstyp;
        _byggnadsar = i.byggnadsar;
        _size = i.size;
        _grundlaeggning = i.grundlaeggning;
        _yttertakType = i.yttertakType;
        _yttertakAge = i.yttertakAge;
        _fasadType = i.fasadType;
        _fasadAge = i.fasadAge;
        _uppvarmning = i.uppvarmning;
        _ventilation = i.ventilation;
      });
    }
  }

  void _onFieldChanged() {
    if (_existingReport == null) return;
    _debounceTimer?.cancel();
    _debounceTimer = Timer(const Duration(milliseconds: 500), _debouncedSave);
  }

  Future<void> _debouncedSave() async {
    _debounceTimer?.cancel();
    final errors = HouseInputsValidator.validateNumeric(
      byggnadsar: _byggnadsar,
      size: _size,
      yttertakAge: _yttertakAge,
      fasadAge: _fasadAge,
    );
    if (errors.isNotEmpty || _byggnadsar == null || _size == null || _yttertakAge == null || _fasadAge == null) return;
    final inputs = HouseInputs(
      byggnadstyp: _byggnadstyp,
      byggnadsar: _byggnadsar!,
      size: _size!,
      grundlaeggning: _grundlaeggning,
      yttertakType: _yttertakType,
      yttertakAge: _yttertakAge!,
      fasadType: _fasadType,
      fasadAge: _fasadAge!,
      uppvarmning: _uppvarmning,
      ventilation: _ventilation,
    );
    final output = RiskEngine.compute(inputs);
    final report = Report(
      id: _existingReport!.id,
      houseLabel: _existingReport!.houseLabel,
      inputs: inputs,
      outputs: output,
      timestamp: DateTime.now(),
      modelVersion: modelVersion,
    );
    await _storage.saveReport(report);
    if (mounted) setState(() => _existingReport = report);
  }

  void _calculate() async {
    final errors = HouseInputsValidator.validateNumeric(
      byggnadsar: _byggnadsar,
      size: _size,
      yttertakAge: _yttertakAge,
      fasadAge: _fasadAge,
    );
    if (errors.isNotEmpty) {
      setState(() => _errors
        ..clear()
        ..addAll(errors));
      return;
    }
    if (_byggnadsar == null || _size == null || _yttertakAge == null || _fasadAge == null) {
      setState(() {
        _errors.clear();
        if (_byggnadsar == null) _errors['byggnadsar'] = 'Required';
        if (_size == null) _errors['size'] = 'Required';
        if (_yttertakAge == null) _errors['yttertakAge'] = 'Required';
        if (_fasadAge == null) _errors['fasadAge'] = 'Required';
      });
      return;
    }
    setState(() => _errors.clear());
    final inputs = HouseInputs(
      byggnadstyp: _byggnadstyp,
      byggnadsar: _byggnadsar!,
      size: _size!,
      grundlaeggning: _grundlaeggning,
      yttertakType: _yttertakType,
      yttertakAge: _yttertakAge!,
      fasadType: _fasadType,
      fasadAge: _fasadAge!,
      uppvarmning: _uppvarmning,
      ventilation: _ventilation,
    );
    final output = RiskEngine.compute(inputs);
    final report = Report(
      id: _existingReport?.id ?? _uuid.v4(),
      houseLabel: inputs.houseLabel ?? '',
      inputs: inputs,
      outputs: output,
      timestamp: DateTime.now(),
      modelVersion: modelVersion,
    );
    await _storage.saveReport(report);
    setState(() => _existingReport = report);
    if (!mounted) return;
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => ReportResultScreen(report: report),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(title: Text(l10n.houseData)),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              ByggnadstypField(
                value: _byggnadstyp,
                onChanged: (v) {
                  setState(() => _byggnadstyp = v);
                  _onFieldChanged();
                },
              ),
              const SizedBox(height: 16),
              NumericFields(
                buildYear: _byggnadsar,
                size: _size,
                onBuildYearChanged: (v) {
                  setState(() => _byggnadsar = v);
                  _onFieldChanged();
                },
                onSizeChanged: (v) {
                  setState(() => _size = v);
                  _onFieldChanged();
                },
                buildYearError: _errors['byggnadsar'],
                sizeError: _errors['size'],
              ),
              const SizedBox(height: 16),
              GrundlaeggningField(
                value: _grundlaeggning,
                onChanged: (v) {
                  setState(() => _grundlaeggning = v);
                  _onFieldChanged();
                },
              ),
              const SizedBox(height: 16),
              YttertakFields(
                typeValue: _yttertakType,
                ageValue: _yttertakAge,
                onTypeChanged: (v) {
                  setState(() => _yttertakType = v);
                  _onFieldChanged();
                },
                onAgeChanged: (v) {
                  setState(() => _yttertakAge = v);
                  _onFieldChanged();
                },
                ageError: _errors['yttertakAge'],
              ),
              const SizedBox(height: 16),
              FasadFields(
                typeValue: _fasadType,
                ageValue: _fasadAge,
                onTypeChanged: (v) {
                  setState(() => _fasadType = v);
                  _onFieldChanged();
                },
                onAgeChanged: (v) {
                  setState(() => _fasadAge = v);
                  _onFieldChanged();
                },
                ageError: _errors['fasadAge'],
              ),
              const SizedBox(height: 16),
              UppvarmningField(
                value: _uppvarmning,
                onChanged: (v) {
                  setState(() => _uppvarmning = v);
                  _onFieldChanged();
                },
              ),
              const SizedBox(height: 16),
              VentilationField(
                value: _ventilation,
                onChanged: (v) {
                  setState(() => _ventilation = v);
                  _onFieldChanged();
                },
              ),
              const SizedBox(height: 32),
              FilledButton.icon(
                onPressed: _calculate,
                icon: const Icon(Icons.calculate),
                label: Text(l10n.calculate),
                style: FilledButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
