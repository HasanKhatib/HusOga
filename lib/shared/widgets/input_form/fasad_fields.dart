import 'package:flutter/material.dart';

import '../../../core/models/fasad_type.dart';
import '../../../l10n/app_localizations.dart';

class FasadFields extends StatelessWidget {
  const FasadFields({
    super.key,
    required this.typeValue,
    required this.ageValue,
    required this.onTypeChanged,
    required this.onAgeChanged,
    this.typeError,
    this.ageError,
  });

  final String typeValue;
  final int? ageValue;
  final ValueChanged<String> onTypeChanged;
  final ValueChanged<int?> onAgeChanged;
  final String? typeError;
  final String? ageError;

  static const _enums = [
    FasadType.tegel,
    FasadType.tra,
    FasadType.puts,
    FasadType.blandad,
  ];

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final labels = [l10n.tegel, l10n.tra, l10n.puts, l10n.blandad];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        DropdownButtonFormField<String>(
          value: typeValue.isEmpty ? _enums.first.name : typeValue,
          decoration: InputDecoration(
            labelText: l10n.fasadType,
            errorText: typeError,
          ),
          items: List.generate(
            _enums.length,
            (i) => DropdownMenuItem(
              value: _enums[i].name,
              child: Text(labels[i]),
            ),
          ),
          onChanged: (v) => onTypeChanged(v ?? _enums.first.name),
        ),
        const SizedBox(height: 16),
        TextFormField(
          initialValue: ageValue?.toString() ?? '',
          decoration: InputDecoration(
            labelText: l10n.fasadAge,
            hintText: 'År sedan målning/omputsning',
            errorText: ageError,
          ),
          keyboardType: TextInputType.number,
          onChanged: (s) => onAgeChanged(int.tryParse(s)),
        ),
      ],
    );
  }
}
