const STORAGE_KEY = 'searchaudio_access_group';

export function getAccessContext(): string {
  const fromUrl = new URLSearchParams(window.location.search).get('group')?.trim().toLowerCase() || '';
  if (/^[a-z0-9-]{1,100}$/.test(fromUrl)) {
    sessionStorage.setItem(STORAGE_KEY, fromUrl);
    return fromUrl;
  }
  return sessionStorage.getItem(STORAGE_KEY) || '';
}

export function authenticatedHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const token = localStorage.getItem('token');
  const accessContext = getAccessContext();
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(accessContext ? { 'X-Access-Group': accessContext } : {}),
  };
}
