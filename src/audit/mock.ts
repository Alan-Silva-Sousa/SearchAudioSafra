import type { AuditEvent, AuditEventsQuery, AuditEventsResponse, Permission } from './contract';
import { filterAuditEvents, resolveJustificationRequired, resolveMockPermissions } from './queryEvents';

function locationParts() {
  return {
    search: typeof window === 'undefined' ? '' : window.location.search,
    hash: typeof window === 'undefined' ? '' : window.location.hash,
  };
}

export function mockPermissions(): Permission[] {
  const { search, hash } = locationParts();
  const stored = typeof sessionStorage === 'undefined' ? null : sessionStorage.getItem('search_permissions');
  return resolveMockPermissions(search, hash, stored);
}

export function mockJustificationRequired(): boolean {
  const { search, hash } = locationParts();
  const stored = typeof sessionStorage === 'undefined' ? null : sessionStorage.getItem('search_download_justification');
  return resolveJustificationRequired(search, hash, stored);
}

const MOCK_EVENTS: AuditEvent[] = Array.from({ length: 48 }, (_, index) => {
  const actions = ['LOGIN', 'SEARCH', 'PLAY', 'DOWNLOAD', 'DOWNLOAD_ZIP', 'S3_EXPORT_SUCCESS', 'PURGE_SUCCESS'] as const;
  const results = ['SUCCESS', 'FAILURE', 'BLOCKED'] as const;
  const groups = ['grupo-a', 'grupo-b', 'retencao'];
  const action = actions[index % actions.length];
  return {
    id: `evt-${String(index + 1).padStart(3, '0')}`,
    timestamp: new Date(Date.UTC(2026, 7, 17, 12, index, 0)).toISOString(),
    actor: index % 3 === 0 ? 'inspetoria.user' : 'operador.user',
    action,
    result: results[index % results.length],
    accessGroup: groups[index % groups.length],
    conversationId: `conv-${String((index % 9) + 1).padStart(2, '0')}`,
    recordingId: `rec-${String((index % 12) + 1).padStart(2, '0')}`,
    downloadKind: action.startsWith('DOWNLOAD') ? (action === 'DOWNLOAD_ZIP' ? 'ZIP' : 'SINGLE') : undefined,
  };
});

export function mockAuditEvents(query: AuditEventsQuery): AuditEventsResponse {
  return filterAuditEvents(MOCK_EVENTS, query);
}

export { MOCK_EVENTS };
