const STORAGE_KEY = 'searchaudio_access_group';
const PENDING_GROUP_KEY = 'pending_access_group';
const MEDIA = 'audio' as const;

export type MediaKind = 'audio' | 'video';

export function extractBaseSlug(slug: string): string {
  const normalized = slug.trim().toLowerCase();
  if (normalized.startsWith('audio-')) return normalized.slice(6);
  if (normalized.startsWith('video-')) return normalized.slice(6);
  return normalized;
}

export function toMediaSlug(slug: string, media: MediaKind): string {
  const base = extractBaseSlug(slug);
  if (!base) return '';
  return `${media}-${base}`;
}

export function normalizeMediaSlug(slug: string, media: MediaKind = MEDIA): string {
  const normalized = slug.trim().toLowerCase();
  if (!normalized) return '';
  if (normalized.startsWith(`${media}-`)) return normalized;
  if (normalized.startsWith('audio-') || normalized.startsWith('video-')) return normalized;
  return `${media}-${normalized}`;
}

export function normalizeGroup(slug: string, media: MediaKind = MEDIA): string {
  return normalizeMediaSlug(slug, media);
}

export function matchesAccessGroupSlug(current: string, groupSlug: string): boolean {
  if (groupSlug === current) return true;
  return extractBaseSlug(groupSlug) === extractBaseSlug(current);
}

export function findAuthorizedGroupSlug(
  candidate: string,
  groups: Array<{ slug: string }>,
): string | null {
  if (!candidate || !groups.length) return null;
  const normalized = candidate.trim().toLowerCase();
  const exact = groups.find((group) => group.slug === normalized);
  if (exact) return exact.slug;
  if (!/^(audio|video)-/.test(normalized)) {
    const legacy = normalizeMediaSlug(normalized);
    const legacyMatch = groups.find(
      (group) => group.slug === legacy || matchesAccessGroupSlug(normalized, group.slug),
    );
    if (legacyMatch) return legacyMatch.slug;
  }
  return null;
}

export function readGroupFromUrl(): string {
  const group = new URLSearchParams(window.location.search).get('group')?.trim().toLowerCase() || '';
  return /^[a-z0-9-]{1,100}$/.test(group) ? group : '';
}

export function capturePendingGroupFromUrl(): void {
  const group = readGroupFromUrl();
  if (group) {
    localStorage.setItem(PENDING_GROUP_KEY, normalizeMediaSlug(group));
  }
}

export function getPendingGroup(): string {
  const raw = localStorage.getItem(PENDING_GROUP_KEY) || '';
  if (!/^[a-z0-9-]{1,100}$/.test(raw)) return '';
  return normalizeMediaSlug(raw);
}

export function clearPendingGroup(): void {
  localStorage.removeItem(PENDING_GROUP_KEY);
}

export function consumePendingGroupIfAuthorized(groups: Array<{ slug: string }>): string | null {
  const pending = getPendingGroup();
  if (!pending) return null;
  const match = findAuthorizedGroupSlug(pending, groups);
  if (match) clearPendingGroup();
  return match;
}

export function setPendingGroup(slug: string, media: MediaKind = MEDIA): void {
  const value = toMediaSlug(slug, media);
  if (/^[a-z0-9-]{1,100}$/.test(value)) {
    localStorage.setItem(PENDING_GROUP_KEY, value);
  }
}

export function hasPairedMediaAccess(
  currentSlug: string,
  sessionGroups: Array<{ slug: string }>,
  targetMedia: MediaKind,
): boolean {
  if (!currentSlug) return false;
  const pairedSlug = toMediaSlug(currentSlug, targetMedia);
  return findAuthorizedGroupSlug(pairedSlug, sessionGroups) !== null;
}

export function syncGroupInUrl(slug: string): void {
  const url = new URL(window.location.href);
  if (slug) {
    url.searchParams.set('group', slug);
  } else {
    url.searchParams.delete('group');
  }
  const hash = url.hash.includes('?') ? url.hash.split('?')[0] : url.hash;
  window.history.replaceState(null, '', `${url.pathname}${url.search}${hash}`);
}

export function getAccessContext(): string {
  const fromUrl = readGroupFromUrl();
  const raw = fromUrl || sessionStorage.getItem(STORAGE_KEY) || '';
  if (!/^[a-z0-9-]{1,100}$/.test(raw)) return '';
  const normalized = normalizeMediaSlug(raw);
  sessionStorage.setItem(STORAGE_KEY, normalized);
  return normalized;
}

export function setAccessContext(slug: string): void {
  const value = normalizeMediaSlug(slug);
  if (!/^[a-z0-9-]{1,100}$/.test(value)) return;
  sessionStorage.setItem(STORAGE_KEY, value);
}

export function changeMedia(group: string, target: MediaKind): string {
  const converted = toMediaSlug(group, target);
  return converted ? `/${target}/?group=${encodeURIComponent(converted)}` : `/${target}/`;
}

export function appUrl(target: MediaKind): string {
  const converted = toMediaSlug(getAccessContext(), target);
  if (converted) setPendingGroup(converted, target);
  return changeMedia(getAccessContext(), target);
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
