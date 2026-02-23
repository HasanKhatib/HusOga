import 'package:flutter/material.dart';

import '../../../core/models/yttertak_type.dart';
import '../../../l10n/app_localizations.dart';

class YttertakFields extends StatelessWidget {
  const YttertakFields({
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
    YttertakType.betongpannor,
    YttertakType.tegeltak,
    YttertakType.plattak,
    YttertakType.takpapp,
    YttertakType.gummiduk,
    YttertakType.other,
  ];

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final labels = [
      l10n.betongpannor,
      l10n.tegeltak,
      l10n.plattak,
      l10n.takpapp,
      l10n.gummiduk,
      l10n.ovrigt,
    ];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        DropdownButtonFormField<String>(
          value: typeValue.isEmpty ? _enums.first.name : typeValue,
          decoration: InputDecoration(
            labelText: l10n.yttertakType,
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
            labelText: l10n.yttertakAge,
            hintText: 'År sedan nytt/ombygge',
            errorText: ageError,
          ),
          keyboardType: TextInputType.number,
          onChanged: (s) => onAgeChanged(int.tryParse(s)),
        ),
      ],
    );
  }
}
