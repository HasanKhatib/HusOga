import 'package:flutter/material.dart';

import '../../../core/models/grundlaeggning.dart';
import '../../../l10n/app_localizations.dart';

class GrundlaeggningField extends StatelessWidget {
  const GrundlaeggningField({
    super.key,
    required this.value,
    required this.onChanged,
    this.errorText,
  });

  final String value;
  final ValueChanged<String> onChanged;
  final String? errorText;

  static const _enums = [
    Grundlaeggning.kellarYttervaeggar,
    Grundlaeggning.betongplatta,
    Grundlaeggning.torpargrund,
    Grundlaeggning.kellargrund,
    Grundlaeggning.other,
  ];

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final labels = [
      l10n.kellarYttervaeggar,
      l10n.betongplatta,
      l10n.torpargrund,
      l10n.kellargrund,
      l10n.ovrigt,
    ];
    return DropdownButtonFormField<String>(
      value: value.isEmpty ? _enums.first.name : value,
      decoration: InputDecoration(
        labelText: l10n.grundlaeggning,
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
