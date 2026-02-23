import 'package:flutter/material.dart';

import '../../../l10n/app_localizations.dart';

class RiskScoreCard extends StatelessWidget {
  const RiskScoreCard({
    super.key,
    required this.score,
    required this.scoreBand,
    required this.l10n,
  });

  final int score;
  final String scoreBand;
  final AppLocalizations l10n;

  Color _bandColor() {
    switch (scoreBand) {
      case 'low':
        return Colors.green;
      case 'medium':
        return Colors.orange;
      case 'high':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  String _bandLabel() {
    switch (scoreBand) {
      case 'low':
        return l10n.lowRisk;
      case 'medium':
        return l10n.mediumRisk;
      case 'high':
        return l10n.highRisk;
      default:
        return scoreBand;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            Text(
              l10n.riskScore,
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            Text(
              '$score',
              style: Theme.of(context).textTheme.displayLarge?.copyWith(
                    color: _bandColor(),
                    fontWeight: FontWeight.bold,
                  ),
            ),
            Text(
              _bandLabel(),
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: _bandColor(),
                  ),
            ),
          ],
        ),
      ),
    );
  }
}
