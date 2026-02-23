/// Input validation per FR-016.
/// Build year 1800–current, area 10–2000, ages 0–150.
class HouseInputsValidator {
  static const int minBuildYear = 1800;
  static const double minArea = 10;
  static const double maxArea = 2000;
  static const int minAge = 0;
  static const int maxAge = 150;

  static int get currentYear => DateTime.now().year;

  static String? validateBuildYear(int? value) {
    if (value == null) return null;
    if (value < minBuildYear) return 'Must be $minBuildYear or later';
    if (value > currentYear) return 'Must be $currentYear or earlier';
    return null;
  }

  static String? validateArea(double? value) {
    if (value == null) return null;
    if (value < minArea) return 'Must be at least $minArea m²';
    if (value > maxArea) return 'Must be at most $maxArea m²';
    return null;
  }

  static const int maxAddressLength = 200;

  static String? validateAddress(String? value) {
    if (value == null || value.isEmpty) return null;
    if (value.length > maxAddressLength) return 'Max $maxAddressLength characters';
    return null;
  }

  static String? validateAge(int? value) {
    if (value == null) return null;
    if (value < minAge) return 'Must be $minAge–$maxAge';
    if (value > maxAge) return 'Must be $minAge–$maxAge';
    return null;
  }

  /// Validates all required numeric inputs. Returns map of field -> error.
  static Map<String, String> validateNumeric({
    int? byggnadsar,
    double? size,
    int? yttertakAge,
    int? fasadAge,
    int? hangrannorAge,
    int? fonsterAge,
    int? draneringAge,
    int? vatrumAge,
    int? skorstenSealAge,
    int? luftvarmepumpAge,
  }) {
    final errors = <String, String>{};
    if (byggnadsar == null) errors['byggnadsar'] = 'Required';
    if (size == null) errors['size'] = 'Required';
    if (yttertakAge == null) errors['yttertakAge'] = 'Required';
    if (fasadAge == null) errors['fasadAge'] = 'Required';
    if (byggnadsar != null) {
      final by = validateBuildYear(byggnadsar);
      if (by != null) errors['byggnadsar'] = by;
    }
    if (size != null) {
      final ar = validateArea(size);
      if (ar != null) errors['size'] = ar;
    }
    if (yttertakAge != null) {
      final ya = validateAge(yttertakAge);
      if (ya != null) errors['yttertakAge'] = ya;
    }
    if (fasadAge != null) {
      final fa = validateAge(fasadAge);
      if (fa != null) errors['fasadAge'] = fa;
    }
    if (hangrannorAge != null) {
      final e = validateAge(hangrannorAge);
      if (e != null) errors['hangrannorAge'] = e;
    }
    if (fonsterAge != null) {
      final e = validateAge(fonsterAge);
      if (e != null) errors['fonsterAge'] = e;
    }
    if (draneringAge != null) {
      final e = validateAge(draneringAge);
      if (e != null) errors['draneringAge'] = e;
    }
    if (vatrumAge != null) {
      final e = validateAge(vatrumAge);
      if (e != null) errors['vatrumAge'] = e;
    }
    if (skorstenSealAge != null) {
      final e = validateAge(skorstenSealAge);
      if (e != null) errors['skorstenSealAge'] = e;
    }
    if (luftvarmepumpAge != null) {
      final e = validateAge(luftvarmepumpAge);
      if (e != null) errors['luftvarmepumpAge'] = e;
    }
    return errors;
  }
}
