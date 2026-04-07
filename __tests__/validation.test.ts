import {
  validateBuildYear,
  validateArea,
  validateAge,
  validateAddress,
  validateNumeric,
} from '../src/core/validation';

describe('validateBuildYear', () => {
  test('accepts 1800', () => expect(validateBuildYear(1800)).toBeNull());
  test('accepts current year', () => expect(validateBuildYear(new Date().getFullYear())).toBeNull());
  test('rejects 1799', () => expect(validateBuildYear(1799)).not.toBeNull());
  test('rejects future year', () => expect(validateBuildYear(new Date().getFullYear() + 1)).not.toBeNull());
  test('returns null for null input', () => expect(validateBuildYear(null)).toBeNull());
});

describe('validateArea', () => {
  test('accepts 10', () => expect(validateArea(10)).toBeNull());
  test('accepts 2000', () => expect(validateArea(2000)).toBeNull());
  test('accepts midpoint', () => expect(validateArea(120)).toBeNull());
  test('rejects 9', () => expect(validateArea(9)).not.toBeNull());
  test('rejects 2001', () => expect(validateArea(2001)).not.toBeNull());
  test('returns null for null input', () => expect(validateArea(null)).toBeNull());
});

describe('validateAge', () => {
  test('accepts 0', () => expect(validateAge(0)).toBeNull());
  test('accepts 150', () => expect(validateAge(150)).toBeNull());
  test('accepts 50', () => expect(validateAge(50)).toBeNull());
  test('rejects -1', () => expect(validateAge(-1)).not.toBeNull());
  test('rejects 151', () => expect(validateAge(151)).not.toBeNull());
});

describe('validateAddress', () => {
  test('accepts null', () => expect(validateAddress(null)).toBeNull());
  test('accepts empty string', () => expect(validateAddress('')).toBeNull());
  test('accepts normal address', () => expect(validateAddress('Storgatan 12')).toBeNull());
  test('rejects string > 200 chars', () => expect(validateAddress('a'.repeat(201))).not.toBeNull());
});

describe('validateNumeric', () => {
  test('returns empty map for all valid required fields', () => {
    const errors = validateNumeric({ byggnadsar: 1990, size: 120, yttertakAge: 10, fasadAge: 5 });
    expect(Object.keys(errors)).toHaveLength(0);
  });

  test('returns errors for all missing required fields', () => {
    const errors = validateNumeric({});
    expect(errors).toHaveProperty('byggnadsar');
    expect(errors).toHaveProperty('size');
    expect(errors).toHaveProperty('yttertakAge');
    expect(errors).toHaveProperty('fasadAge');
  });

  test('validates optional draneringAge if provided', () => {
    const errors = validateNumeric({ byggnadsar: 1990, size: 120, yttertakAge: 5, fasadAge: 5, draneringAge: -1 });
    expect(errors).toHaveProperty('draneringAge');
  });
});
