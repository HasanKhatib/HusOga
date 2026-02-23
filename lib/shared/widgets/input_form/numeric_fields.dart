import 'package:flutter/material.dart';

import '../../../l10n/app_localizations.dart';

class NumericFields extends StatelessWidget {
  const NumericFields({
    super.key,
    required this.buildYear,
    required this.size,
    required this.onBuildYearChanged,
    required this.onSizeChanged,
    this.buildYearError,
    this.sizeError,
  });

  final int? buildYear;
  final double? size;
  final ValueChanged<int?> onBuildYearChanged;
  final ValueChanged<double?> onSizeChanged;
  final String? buildYearError;
  final String? sizeError;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        TextFormField(
          initialValue: buildYear?.toString() ?? '',
          decoration: InputDecoration(
            labelText: l10n.byggnadsar,
            hintText: '1800–nuv',
            errorText: buildYearError,
          ),
          keyboardType: TextInputType.number,
          onChanged: (s) => onBuildYearChanged(int.tryParse(s)),
        ),
        const SizedBox(height: 16),
        TextFormField(
          initialValue: size?.toString() ?? '',
          decoration: InputDecoration(
            labelText: l10n.boarea,
            hintText: '10–2000',
            errorText: sizeError,
          ),
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          onChanged: (s) => onSizeChanged(double.tryParse(s.replaceAll(',', '.'))),
        ),
      ],
    );
  }
}
