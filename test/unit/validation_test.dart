import 'package:flutter_test/flutter_test.dart';
import 'package:house_risk_snapshot/core/validation.dart';

void main() {
  group('HouseInputsValidator', () {
    test('validateBuildYear accepts 1800 to current year', () {
      expect(HouseInputsValidator.validateBuildYear(1800), isNull);
      expect(HouseInputsValidator.validateBuildYear(2000), isNull);
      expect(
        HouseInputsValidator.validateBuildYear(
          HouseInputsValidator.currentYear,
        ),
        isNull,
      );
    });

    test('validateBuildYear rejects before 1800', () {
      expect(
        HouseInputsValidator.validateBuildYear(1799),
        isNotNull,
      );
    });

    test('validateBuildYear rejects future years', () {
      expect(
        HouseInputsValidator.validateBuildYear(
          HouseInputsValidator.currentYear + 1,
        ),
        isNotNull,
      );
    });

    test('validateArea accepts 10 to 2000', () {
      expect(HouseInputsValidator.validateArea(10.0), isNull);
      expect(HouseInputsValidator.validateArea(2000.0), isNull);
      expect(HouseInputsValidator.validateArea(120.5), isNull);
    });

    test('validateArea rejects below 10', () {
      expect(HouseInputsValidator.validateArea(9.0), isNotNull);
    });

    test('validateArea rejects above 2000', () {
      expect(HouseInputsValidator.validateArea(2001.0), isNotNull);
    });

    test('validateAge accepts 0 to 150', () {
      expect(HouseInputsValidator.validateAge(0), isNull);
      expect(HouseInputsValidator.validateAge(150), isNull);
      expect(HouseInputsValidator.validateAge(50), isNull);
    });

    test('validateAge rejects negative', () {
      expect(HouseInputsValidator.validateAge(-1), isNotNull);
    });

    test('validateAge rejects above 150', () {
      expect(HouseInputsValidator.validateAge(151), isNotNull);
    });

    test('validateNumeric returns empty for valid inputs', () {
      final errors = HouseInputsValidator.validateNumeric(
        byggnadsar: 1990,
        size: 120,
        yttertakAge: 15,
        fasadAge: 10,
      );
      expect(errors, isEmpty);
    });

    test('validateNumeric returns errors for invalid inputs', () {
      final errors = HouseInputsValidator.validateNumeric(
        byggnadsar: 1700,
        size: 5,
        yttertakAge: 200,
        fasadAge: -1,
      );
      expect(errors, isNotEmpty);
      expect(errors['byggnadsar'], isNotNull);
      expect(errors['size'], isNotNull);
      expect(errors['yttertakAge'], isNotNull);
      expect(errors['fasadAge'], isNotNull);
    });
  });
}
