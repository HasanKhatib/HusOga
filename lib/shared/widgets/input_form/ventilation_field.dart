import 'package:flutter/material.dart';

import '../../../core/models/ventilation.dart';
import '../../../l10n/app_localizations.dart';

class VentilationField extends StatelessWidget {
  const VentilationField({
    super.key,
    required this.value,
    required this.onChanged,
    this.errorText,
  });

  final String value;
  final ValueChanged<String> onChanged;
  final String? errorText;

  static const _enums = [
    Ventilation.sjalvdrag,
    Ventilation.franluft,
    Ventilation.ftxMekanisk,
  ];

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final labels = [l10n.sjalvdrag, l10n.franluft, l10n.ftxMekanisk];
    return DropdownButtonFormField<String>(
      value: value.isEmpty ? _enums.first.name : value,
      decoration: InputDecoration(
        labelText: l10n.ventilation,
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
