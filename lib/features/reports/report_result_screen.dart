import 'package:flutter/material.dart';

import '../../core/models/report.dart';
import '../../l10n/app_localizations.dart';
import '../../shared/widgets/risk_display/checklist_card.dart';
import '../../shared/widgets/risk_display/cost_band_card.dart';
import '../../shared/widgets/risk_display/lifecycle_flags_card.dart';
import '../../shared/widgets/risk_display/risk_score_card.dart';

class ReportResultScreen extends StatelessWidget {
  const ReportResultScreen({
    super.key,
    required this.report,
  });

  final Report report;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final output = report.outputs;
    return Scaffold(
      appBar: AppBar(title: Text(l10n.riskAssessment)),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              l10n.reportIntro,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 24),
            Text(
              l10n.reportSectionScore,
              style: Theme.of(context).textTheme.titleSmall?.copyWith(
                color: Theme.of(context).colorScheme.primary,
              ),
            ),
            const SizedBox(height: 8),
            RiskScoreCard(
              score: output.score,
              scoreBand: output.scoreBand,
              l10n: l10n,
            ),
            const SizedBox(height: 20),
            Text(
              l10n.reportSectionFlags,
              style: Theme.of(context).textTheme.titleSmall?.copyWith(
                color: Theme.of(context).colorScheme.primary,
              ),
            ),
            const SizedBox(height: 8),
            LifecycleFlagsCard(flags: output.lifecycleFlags, l10n: l10n            ),
            const SizedBox(height: 20),
            Text(
              l10n.reportSectionCost,
              style: Theme.of(context).textTheme.titleSmall?.copyWith(
                color: Theme.of(context).colorScheme.primary,
              ),
            ),
            const SizedBox(height: 8),
            CostBandCard(costBand: output.costBand, l10n: l10n            ),
            const SizedBox(height: 20),
            Text(
              l10n.reportSectionChecklist,
              style: Theme.of(context).textTheme.titleSmall?.copyWith(
                color: Theme.of(context).colorScheme.primary,
              ),
            ),
            const SizedBox(height: 8),
            ChecklistCard(items: output.negotiationChecklist, l10n: l10n),
            const SizedBox(height: 24),
            Text(
              l10n.legalDisclaimer,
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ],
        ),
      ),
    );
  }
}
