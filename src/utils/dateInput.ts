import { format, isValid, parse } from 'date-fns';

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
  return value ? format(value, API_DATE_FORMAT) : '';
}
