import 'package:flutter/material.dart';

import '../../../core/models/lifecycle_flag.dart';
import '../../../l10n/app_localizations.dart';

class LifecycleFlagsCard extends StatelessWidget {
  const LifecycleFlagsCard({
    super.key,
    required this.flags,
    required this.l10n,
  });

  final List<LifecycleFlag> flags;
  final AppLocalizations l10n;

  String _componentLabel(String c) {
    switch (c) {
      case 'roof':
        return l10n.componentRoof;
      case 'drainage':
        return l10n.componentDrainage;
      case 'facade':
        return l10n.componentFacade;
      case 'ventilation':
        return l10n.componentVentilation;
      case 'heating':
        return l10n.componentHeating;
      case 'wetRooms':
        return l10n.componentWetRooms;
      default:
        return c;
    }
  }

  @override
  Widget build(BuildContext context) {
    if (flags.isEmpty) {
      return Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Text(
            l10n.noLifecycleFlags,
            style: Theme.of(context).textTheme.bodyLarge,
          ),
        ),
      );
    }
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              l10n.lifecycleFlags,
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 12),
            ...flags.map((f) => Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(
                            f.level == 'highRisk'
                                ? Icons.warning_amber
                                : Icons.info_outline,
                            color: f.level == 'highRisk'
                                ? Colors.orange
                                : Colors.blue,
                            size: 20,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            _componentLabel(f.component),
                            style: const TextStyle(
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const Spacer(),
                          Text(
                            '${f.contributionPercent}%',
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                        ],
                      ),
                      if (f.triggeredBy.isNotEmpty)
                        Padding(
                          padding: const EdgeInsets.only(left: 28, top: 4),
                          child: Text(
                            '${l10n.triggeredBy}${f.triggeredBy.join(", ")}',
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                        ),
                    ],
                  ),
                )),
          ],
        ),
      ),
    );
  }
}
