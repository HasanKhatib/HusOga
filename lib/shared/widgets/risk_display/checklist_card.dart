import 'package:flutter/material.dart';

import '../../../l10n/app_localizations.dart';

class ChecklistCard extends StatelessWidget {
  const ChecklistCard({
    super.key,
    required this.items,
    required this.l10n,
  });

  final List<String> items;
  final AppLocalizations l10n;

  String _itemLabel(String key) {
    switch (key) {
      case 'askSellerRoofFacadeDrainage':
        return l10n.askSellerRoofFacadeDrainage;
      case 'demandBuyerInspection':
        return l10n.demandBuyerInspection;
      case 'betongplatta70sCheck':
        return l10n.betongplatta70sCheck;
      case 'vatrumCheck':
        return l10n.vatrumCheck;
      case 'roofSnowCheck':
        return l10n.roofSnowCheck;
      default:
        return key;
    }
  }

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) return const SizedBox.shrink();
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              l10n.negotiationChecklist,
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 12),
            ...items.map((key) => Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(Icons.check_circle_outline, size: 20),
                      const SizedBox(width: 8),
                      Expanded(child: Text(_itemLabel(key))),
                    ],
                  ),
                )),
          ],
        ),
      ),
    );
  }
}
