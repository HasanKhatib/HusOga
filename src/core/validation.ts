const MIN_BUILD_YEAR = 1800;
const MIN_AREA = 10;
const MAX_AREA = 2000;
const MIN_AGE = 0;
const MAX_AGE = 150;
const MAX_ADDRESS_LENGTH = 200;

function currentYear(): number {
  return new Date().getFullYear();
}

export function validateBuildYear(value: number | null | undefined): string | null {
  if (value == null) return null;
  if (value < MIN_BUILD_YEAR) return `Must be ${MIN_BUILD_YEAR} or later`;
  if (value > currentYear()) return `Must be ${currentYear()} or earlier`;
  return null;
}

export function validateArea(value: number | null | undefined): string | null {
  if (value == null) return null;
  if (value < MIN_AREA) return `Must be at least ${MIN_AREA} m²`;
  if (value > MAX_AREA) return `Must be at most ${MAX_AREA} m²`;
  return null;
}

export function validateAge(value: number | null | undefined): string | null {
  if (value == null) return null;
  if (value < MIN_AGE || value > MAX_AGE) return `Must be ${MIN_AGE}–${MAX_AGE}`;
  return null;
}

export function validateAddress(value: string | null | undefined): string | null {
  if (!value) return null;
  if (value.length > MAX_ADDRESS_LENGTH) return `Max ${MAX_ADDRESS_LENGTH} characters`;
  return null;
}

interface NumericFields {
  byggnadsar?: number | null;
  size?: number | null;
  yttertakAge?: number | null;
  fasadAge?: number | null;
  draneringAge?: number | null;
  vatrumAge?: number | null;
}

/** Returns a map of fieldName → errorMessage for all invalid fields. Empty = all valid. */
export function validateNumeric(fields: NumericFields): Record<string, string> {
  const errors: Record<string, string> = {};

  if (fields.byggnadsar == null) errors.byggnadsar = 'Required';
  else { const e = validateBuildYear(fields.byggnadsar); if (e) errors.byggnadsar = e; }

  if (fields.size == null) errors.size = 'Required';
  else { const e = validateArea(fields.size); if (e) errors.size = e; }

  if (fields.yttertakAge == null) errors.yttertakAge = 'Required';
  else { const e = validateAge(fields.yttertakAge); if (e) errors.yttertakAge = e; }

  if (fields.fasadAge == null) errors.fasadAge = 'Required';
  else { const e = validateAge(fields.fasadAge); if (e) errors.fasadAge = e; }

  if (fields.draneringAge != null) { const e = validateAge(fields.draneringAge); if (e) errors.draneringAge = e; }
  if (fields.vatrumAge != null) { const e = validateAge(fields.vatrumAge); if (e) errors.vatrumAge = e; }

  return errors;
}
