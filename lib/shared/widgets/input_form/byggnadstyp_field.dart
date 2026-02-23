import 'package:flutter/material.dart';

import '../../../core/models/byggnadstyp.dart';
import '../../../l10n/app_localizations.dart';

class ByggnadstypField extends StatelessWidget {
  const ByggnadstypField({
    super.key,
    required this.value,
    required this.onChanged,
    this.errorText,
  });

  final String value;
  final ValueChanged<String> onChanged;
  final String? errorText;

  static const _enums = [
    Byggnadstyp.suterranghus,
    Byggnadstyp.enplanshus,
    Byggnadstyp.flerplanshus,
    Byggnadstyp.radhus,
    Byggnadstyp.parhus,
    Byggnadstyp.kedjehus,
    Byggnadstyp.other,
  ];

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final labels = [
      l10n.suterranghus,
      l10n.enplanshus,
      l10n.flerplanshus,
      l10n.radhus,
      l10n.parhus,
      l10n.kedjehus,
      l10n.ovrigt,
    ];
    return DropdownButtonFormField<String>(
      value: value.isEmpty ? _enums.first.name : value,
      decoration: InputDecoration(
        labelText: l10n.byggnadstyp,
        errorText: errorText,
      ),
      items: List.generate(
        _enums.length,
        (i) => DropdownMenuItem(
          value: _enums[i].name,
          child: Text(labels[i]),
        ),
      ),
      onChanged: (v) => onChanged(v ?? _enums.first.name),
    );
  }
}
