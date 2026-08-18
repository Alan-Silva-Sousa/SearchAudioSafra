export function documentDigits(raw: string): string {
  return String(raw || '').replace(/\D/g, '');
}

export function formatCpfCnpj(raw?: string | null): string {
  const digits = documentDigits(raw || '');
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }
  if (digits.length === 14) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
  }
  return String(raw || '').trim() || '-';
}
