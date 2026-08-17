import type { AuditEvent, AuditEventsQuery, AuditEventsResponse, Permission } from './contract';
import { PERMISSIONS } from './contract';

export const ALL_PERMISSIONS = Object.values(PERMISSIONS);

export function readParam(search: string, hash: string, name: string): string | null {
  const fromSearch = new URLSearchParams(search || '').get(name);
  if (fromSearch !== null) return fromSearch;
  const hashQuery = String(hash || '').split('?')[1] || '';
  return new URLSearchParams(hashQuery).get(name);
}

export function resolveMockPermissions(
  search: string,
  hash: string,
  stored: string | null,
): Permission[] {
  const fromQuery = readParam(search, hash, 'permissions');
  if (fromQuery === 'none') return [];
  if (fromQuery) {
    return fromQuery.split(',').map((value) => value.trim()).filter(Boolean) as Permission[];
  }
  if (stored === 'none') return [];
  if (stored) return stored.split(',').map((value) => value.trim()).filter(Boolean) as Permission[];
  return [...ALL_PERMISSIONS];
}

export function resolveJustificationRequired(search: string, hash: string, stored: string | null): boolean {
  const fromQuery = readParam(search, hash, 'justification');
  if (fromQuery === '1' || fromQuery === 'true') return true;
  return stored === 'true';
}

export function filterAuditEvents(events: AuditEvent[], query: AuditEventsQuery): AuditEventsResponse {
  const page = Math.max(1, query.page || 1);
  const pageSize = Math.min(100, Math.max(1, query.pageSize || 20));
  const filtered = events.filter((event) => {
    if (query.from && event.timestamp < query.from) return false;
    if (query.to && event.timestamp > `${query.to}T23:59:59.999Z` && !query.to.includes('T')) return false;
    if (query.to && query.to.includes('T') && event.timestamp > query.to) return false;
    if (query.user && !String(event.actor || '').toLowerCase().includes(query.user.toLowerCase())) return false;
    if (query.action && event.action !== query.action) return false;
    if (query.result && event.result !== query.result) return false;
    if (query.group && event.accessGroup !== query.group) return false;
    if (query.conversationId && event.conversationId !== query.conversationId) return false;
    if (query.recordingId && event.recordingId !== query.recordingId) return false;
    return true;
  });
  const start = (page - 1) * pageSize;
  return {
    items: filtered.slice(start, start + pageSize),
    total: filtered.length,
    page,
    pageSize,
  };
}
