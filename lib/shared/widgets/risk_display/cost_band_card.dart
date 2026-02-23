import 'package:flutter/material.dart';

import '../../../core/models/cost_band.dart';
import '../../../l10n/app_localizations.dart';

class CostBandCard extends StatelessWidget {
  const CostBandCard({
    super.key,
    required this.costBand,
    required this.l10n,
  });

  final CostBand costBand;
  final AppLocalizations l10n;

  String _formatSek(int value) {
    if (value >= 1000000) {
      return '${(value / 1000000).toStringAsFixed(1)} M SEK';
    }
    if (value >= 1000) {
      return '${(value / 1000).round()} k SEK';
    }
    return '$value SEK';
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              l10n.costExposure,
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('${l10n.min}:', style: Theme.of(context).textTheme.bodyMedium),
                Text(_formatSek(costBand.min)),
              ],
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('${l10n.likely}:', style: Theme.of(context).textTheme.bodyMedium),
                Text(
                  _formatSek(costBand.likely),
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
              ],
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('${l10n.max}:', style: Theme.of(context).textTheme.bodyMedium),
                Text(_formatSek(costBand.max)),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
