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

export function filterAuditEvents(events: AuditEvent[], query: AuditEventsQuery): AuditEventsResponse {
  const page = Math.max(1, query.page || 1);
  const limit = Math.min(200, Math.max(1, query.limit || 50));
  const filtered = events.filter((event) => {
    if (query.start && event.timestamp < query.start) return false;
    if (query.end && event.timestamp > `${query.end}T23:59:59.999Z` && !query.end.includes('T')) return false;
    if (query.end && query.end.includes('T') && event.timestamp > query.end) return false;
    if (query.user && !String(event.actor || '').toLowerCase().includes(query.user.toLowerCase())) return false;
    if (query.action && event.action !== query.action) return false;
    if (query.result && event.result !== query.result) return false;
    if (query.accessGroup && event.accessGroup !== query.accessGroup) return false;
    if (query.conversationId && event.conversationId !== query.conversationId) return false;
    if (query.recordingId && event.recordingId !== query.recordingId) return false;
    if (query.correlationId && event.correlationId !== query.correlationId) return false;
    return true;
  });
  const offset = (page - 1) * limit;
  return {
    items: filtered.slice(offset, offset + limit),
    total: filtered.length,
    page,
    limit,
  };
}
