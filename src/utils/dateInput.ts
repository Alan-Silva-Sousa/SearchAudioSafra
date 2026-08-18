import { endOfDay, format, isValid, parse, startOfDay } from 'date-fns';

export const BR_DATE_FORMAT = 'dd/MM/yyyy';
export const API_DATE_FORMAT = 'yyyy-MM-dd';

export function parseStoredDate(value?: string): Date | null {
  if (!value) return null;
  const iso = parse(value, API_DATE_FORMAT, new Date());
  if (isValid(iso)) return iso;
  const br = parse(value, BR_DATE_FORMAT, new Date());
  return isValid(br) ? br : null;
}

export function toApiDate(value: Date | null): string {
  if (!value || !isValid(value)) return '';
  return format(value, API_DATE_FORMAT);
}

export function toQueryStart(value?: string): string | undefined {
  if (!value) return undefined;
  if (value.includes('T')) return value;
  const date = parseStoredDate(value);
  return date ? format(startOfDay(date), "yyyy-MM-dd'T'HH:mm:ssXXX") : value;
}

export function toQueryEnd(value?: string): string | undefined {
  if (!value) return undefined;
  if (value.includes('T')) return value;
  const date = parseStoredDate(value);
  return date ? format(endOfDay(date), "yyyy-MM-dd'T'HH:mm:ss.SSSXXX") : value;
}
