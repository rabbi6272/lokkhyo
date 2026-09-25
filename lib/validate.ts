export type ValidationResult = string | null;

export function required(value: string, label = 'This field'): ValidationResult {
  return value.trim() ? null : `${label} is required.`;
}

export function isNumeric(value: string, label = 'This field'): ValidationResult {
  if (!value.trim()) return `${label} is required.`;
  if (Number.isNaN(Number(value))) return `${label} must be a number.`;
  return null;
}

export function clampMarks(value: number, max: number): ValidationResult {
  if (value < 0) return 'Marks cannot be negative.';
  if (value > max) return `Marks cannot exceed ${max}.`;
  return null;
}

export function gpaRange(value: number): ValidationResult {
  if (value < 0 || value > 4) return 'GPA must be between 0 and 4.';
  return null;
}

export function isDate(value: string): ValidationResult {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    return 'Date must be in YYYY-MM-DD format.';
  }
  return null;
}

export function isTime(value: string): ValidationResult {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value.trim())) {
    return 'Time must be in HH:MM (24h) format.';
  }
  return null;
}

export function parseTime(value: string): number {
  const [h, m] = value.split(':').map(Number);
  return h * 60 + m;
}
