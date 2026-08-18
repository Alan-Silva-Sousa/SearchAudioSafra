export function onlyDigits(raw: string): string {
  return String(raw || '').replace(/\D/g, '');
}

export function normalizePhoneDigits(raw: string): string {
  let digits = onlyDigits(raw);
  if (digits.startsWith('55') && digits.length > 11) {
    digits = digits.slice(2);
  }
  return digits.slice(-11);
}

export function formatPhone(raw?: string | null): string {
  if (!raw || /^unavailable$/i.test(String(raw).trim())) return '-';
  const cleaned = String(raw).replace(/^tel:\+?/i, '');
  const num = normalizePhoneDigits(cleaned);
  if (num.length === 11 && num[2] === '9') {
    return `(${num.slice(0, 2)}) ${num.slice(2, 3)} ${num.slice(3, 7)}-${num.slice(7)}`;
  }
  if (num.length === 10) {
    return `(${num.slice(0, 2)}) ${num.slice(2, 6)}-${num.slice(6)}`;
  }
  if (num.length >= 7) return num;
  return cleaned || '-';
}

export function phoneSearchDigits(raw: string): string {
  return onlyDigits(raw);
}
