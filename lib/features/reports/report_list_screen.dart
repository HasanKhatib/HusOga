import 'package:flutter/material.dart';

import '../../core/models/report.dart';
import '../../l10n/app_localizations.dart';
import '../../core/services/purchase_service.dart';
import '../../core/services/storage_service.dart';
import 'report_form_screen.dart';

class ReportListScreen extends StatefulWidget {
  const ReportListScreen({super.key, this.onOpenSettings});

  final VoidCallback? onOpenSettings;

  @override
  State<ReportListScreen> createState() => _ReportListScreenState();
}

class _ReportListScreenState extends State<ReportListScreen> {
  final StorageService _storage = StorageService();
  final PurchaseService _purchase = PurchaseService();
  List<Report> _reports = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadReports();
  }

  Future<void> _loadReports() async {
    setState(() => _loading = true);
    final list = await _storage.listReports();
    if (mounted) {
      setState(() {
        _reports = list;
        _loading = false;
      });
    }
  }

  void _createReport() async {
    final canCreate = await _purchase.canCreateReport(_reports.length);
    if (!canCreate && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(AppLocalizations.of(context)!.deleteToAddAnother)),
      );
      return;
    }
    if (!mounted) return;
    Navigator.of(context)
        .push(
          MaterialPageRoute(
            builder: (_) => const ReportFormScreen(),
          ),
        )
        .then((_) => _loadReports());
  }

  void _openReport(Report report) {
    Navigator.of(context)
        .push(
          MaterialPageRoute(
            builder: (_) => ReportFormScreen(reportId: report.id),
          ),
        )
        .then((_) => _loadReports());
  }

  Future<void> _deleteReport(BuildContext context, Report report) async {
    final l10n = AppLocalizations.of(context)!;
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(l10n.deleteReportTitle),
        content: Text(
          l10n.removeReport(report.houseLabel.isNotEmpty ? report.houseLabel : l10n.report),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text(l10n.cancel),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: Text(l10n.delete),
          ),
        ],
      ),
    );
    if (ok == true && mounted) {
      await _storage.deleteReport(report.id);
      _loadReports();
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.reports),
        actions: [
          if (widget.onOpenSettings != null)
            IconButton(
              icon: const Icon(Icons.settings),
              onPressed: widget.onOpenSettings,
            ),
        ],
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              children: [
                Icon(Icons.home_work_outlined, size: 56, color: Theme.of(context).colorScheme.primary),
                const SizedBox(height: 12),
                Text(
                  l10n.appSlogan,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _reports.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.description_outlined, size: 64, color: Colors.grey[400]),
                            const SizedBox(height: 16),
                            Text(
                              l10n.noReportsYet,
                              style: Theme.of(context).textTheme.titleLarge,
                            ),
                            const SizedBox(height: 8),
                            Text(
                              l10n.createFirstAssessment,
                              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                    color: Colors.grey[600],
                                  ),
                              textAlign: TextAlign.center,
                            ),
                          ],
                        ),
                      )
                    : ListView.builder(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  itemCount: _reports.length,
                  itemBuilder: (_, i) {
                    final r = _reports[i];
                    final label = r.houseLabel.isNotEmpty
                        ? r.houseLabel
                        : '${l10n.report} ${r.timestamp.year}-${r.timestamp.month.toString().padLeft(2, '0')}-${r.timestamp.day.toString().padLeft(2, '0')}';
                    return ListTile(
                      title: Text(label),
                      subtitle: Text(
                        '${l10n.score}: ${r.outputs.score}',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                      trailing: IconButton(
                        icon: const Icon(Icons.delete_outline),
                        onPressed: () => _deleteReport(context, r),
                      ),
                      onTap: () => _openReport(r),
                    );
                  },
                ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _createReport,
        icon: const Icon(Icons.add),
        label: Text(l10n.createReport),
      ),
    );
  }
}
