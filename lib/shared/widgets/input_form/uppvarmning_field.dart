import 'package:flutter/material.dart';

import '../../../core/models/uppvarmning.dart';
import '../../../l10n/app_localizations.dart';

class UppvarmningField extends StatelessWidget {
  const UppvarmningField({
    super.key,
    required this.value,
    required this.onChanged,
    this.errorText,
  });

  final String value;
  final ValueChanged<String> onChanged;
  final String? errorText;

  static const _enums = [
    Uppvarmning.direktverkandeEl,
    Uppvarmning.luftLuftVarmepump,
    Uppvarmning.bergvarme,
    Uppvarmning.fjarrvarme,
    Uppvarmning.pellet,
    Uppvarmning.olja,
    Uppvarmning.gas,
    Uppvarmning.other,
  ];

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final labels = [
      l10n.direktverkandeEl,
      l10n.luftLuftVarmepump,
      l10n.bergvarme,
      l10n.fjarrvarme,
      l10n.pellet,
      l10n.olja,
      l10n.gas,
      l10n.ovrigt,
    ];
    return DropdownButtonFormField<String>(
      value: value.isEmpty ? _enums.first.name : value,
      decoration: InputDecoration(
        labelText: l10n.uppvarmning,
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
