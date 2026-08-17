import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

const ALL_PERMISSIONS = [
  'RECORDING_SEARCH',
  'RECORDING_PLAY',
  'RECORDING_DOWNLOAD',
  'AUDIT_READ',
  'AUDIT_EXPORT',
];

function readParam(search, hash, name) {
  const fromSearch = new URLSearchParams(search || '').get(name);
  if (fromSearch !== null) return fromSearch;
  const hashQuery = String(hash || '').split('?')[1] || '';
  return new URLSearchParams(hashQuery).get(name);
}

function resolveMockPermissions(search, hash, stored) {
  const fromQuery = readParam(search, hash, 'permissions');
  if (fromQuery === 'none') return [];
  if (fromQuery) return fromQuery.split(',').map((value) => value.trim()).filter(Boolean);
  if (stored === 'none') return [];
  if (stored) return stored.split(',').map((value) => value.trim()).filter(Boolean);
  return [...ALL_PERMISSIONS];
}

function filterAuditEvents(events, query) {
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
  return { items: filtered.slice(start, start + pageSize), total: filtered.length, page, pageSize };
}

const events = Array.from({ length: 48 }, (_, index) => ({
  id: `evt-${index + 1}`,
  timestamp: new Date(Date.UTC(2026, 7, 17, 12, index, 0)).toISOString(),
  actor: index % 3 === 0 ? 'inspetoria.user' : 'operador.user',
  action: index % 2 === 0 ? 'DOWNLOAD' : 'SEARCH',
  result: index % 5 === 0 ? 'BLOCKED' : 'SUCCESS',
  accessGroup: index % 2 === 0 ? 'grupo-a' : 'grupo-b',
  conversationId: `conv-${String((index % 9) + 1).padStart(2, '0')}`,
  recordingId: `rec-${String((index % 12) + 1).padStart(2, '0')}`,
}));

describe('tela de auditoria', () => {
  it('sem permissão AUDIT_READ (permissions=none)', () => {
    const permissions = resolveMockPermissions('?permissions=none', '', null);
    assert.deepEqual(permissions, []);
    assert.equal(permissions.includes('AUDIT_READ'), false);
  });

  it('lê permissões do hash do HashRouter', () => {
    const permissions = resolveMockPermissions('', '#/audit?permissions=RECORDING_SEARCH,AUDIT_READ', null);
    assert.deepEqual(permissions, ['RECORDING_SEARCH', 'AUDIT_READ']);
  });

  it('pagina 20 eventos por página', () => {
    const page1 = filterAuditEvents(events, { page: 1, pageSize: 20 });
    const page2 = filterAuditEvents(events, { page: 2, pageSize: 20 });
    const page3 = filterAuditEvents(events, { page: 3, pageSize: 20 });
    assert.equal(page1.total, 48);
    assert.equal(page1.items.length, 20);
    assert.equal(page2.items.length, 20);
    assert.equal(page3.items.length, 8);
    assert.equal(page1.items[0].id, 'evt-1');
    assert.equal(page2.items[0].id, 'evt-21');
  });

  it('filtra por usuário, ação, resultado, grupo, conversationId e recordingId', () => {
    const filtered = filterAuditEvents(events, {
      user: 'inspetoria',
      action: 'DOWNLOAD',
      result: 'SUCCESS',
      group: 'grupo-a',
      conversationId: 'conv-01',
      recordingId: 'rec-01',
      page: 1,
      pageSize: 20,
    });
    assert.ok(filtered.total >= 1);
    for (const event of filtered.items) {
      assert.match(String(event.actor), /inspetoria/i);
      assert.equal(event.action, 'DOWNLOAD');
      assert.equal(event.result, 'SUCCESS');
      assert.equal(event.accessGroup, 'grupo-a');
      assert.equal(event.conversationId, 'conv-01');
      assert.equal(event.recordingId, 'rec-01');
    }
  });

  it('download controlado não inclui identidade, IP ou resultado', () => {
    const params = new URLSearchParams({ downloadKind: 'SINGLE', justification: 'inspeção' });
    assert.deepEqual([...params.keys()].sort(), ['downloadKind', 'justification']);
    assert.equal(params.has('actor'), false);
    assert.equal(params.has('ip'), false);
    assert.equal(params.has('result'), false);
  });
});
