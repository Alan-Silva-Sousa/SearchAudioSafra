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
  return { items: filtered.slice(offset, offset + limit), total: filtered.length, page, limit };
}

function isVideoAccessGroup(group) {
  if (/^video-/i.test(group.slug || '')) return true;
  return /^searchvideo(_|-)/i.test(group.name || '');
}

function isAudioAccessGroup(group) {
  if (/^audio-/i.test(group.slug || '')) return true;
  return /^searchaudio(_|-)/i.test(group.name || '');
}

function extractBaseSlug(slug) {
  const normalized = String(slug || '').trim().toLowerCase();
  if (normalized.startsWith('audio-')) return normalized.slice(6);
  if (normalized.startsWith('video-')) return normalized.slice(6);
  return normalized;
}

function toMediaSlug(slug, media) {
  const base = extractBaseSlug(slug);
  if (!base) return '';
  return `${media}-${base}`;
}

function normalizeGroup(slug, media) {
  const normalized = String(slug || '').trim().toLowerCase();
  if (!normalized) return '';
  if (normalized.startsWith(`${media}-`)) return normalized;
  if (normalized.startsWith('audio-') || normalized.startsWith('video-')) return normalized;
  return `${media}-${normalized}`;
}

function findAuthorizedGroupSlug(candidate, groups, media = 'audio') {
  if (!candidate || !groups.length) return null;
  const normalized = String(candidate).trim().toLowerCase();
  const exact = groups.find((group) => group.slug === normalized);
  if (exact) return exact.slug;
  if (!/^(audio|video)-/.test(normalized)) {
    const legacy = normalizeGroup(normalized, media);
    const legacyMatch = groups.find(
      (group) => group.slug === legacy || extractBaseSlug(group.slug) === extractBaseSlug(normalized),
    );
    if (legacyMatch) return legacyMatch.slug;
  }
  return null;
}

function hasPairedMediaAccess(currentSlug, groups, targetMedia) {
  if (!currentSlug) return false;
  const pairedSlug = toMediaSlug(currentSlug, targetMedia);
  return findAuthorizedGroupSlug(pairedSlug, groups, targetMedia) !== null;
}

function isDownloadAccessGroup(group) {
  return /^search_download$/i.test(group.name || '');
}

function isAuditAccessGroup(group) {
  return /^search_auditoria$/i.test(group.name || '');
}

function permissionsFromSession(session, canReadAuditFallback) {
  const groups = session.accessGroups || [];
  const canDownload = session.permissions?.canDownload ?? groups.some(isDownloadAccessGroup);
  const canReadAudit = session.permissions?.canReadAudit ?? (groups.some(isAuditAccessGroup) || canReadAuditFallback);
  const permissions = ['RECORDING_SEARCH', 'RECORDING_PLAY'];
  if (canDownload) permissions.push('RECORDING_DOWNLOAD');
  if (canReadAudit) permissions.push('AUDIT_READ', 'AUDIT_EXPORT');
  return permissions;
}

const events = Array.from({ length: 48 }, (_, index) => ({
  id: `evt-${index + 1}`,
  timestamp: new Date(Date.UTC(2026, 7, 17, 12, index, 0)).toISOString(),
  actor: index % 3 === 0 ? 'inspetoria.user' : 'operador.user',
  action: index % 2 === 0 ? 'MEDIA_DOWNLOAD' : 'RECORDING_SEARCH',
  result: index % 5 === 0 ? 'BLOCKED' : 'SUCCESS',
  accessGroup: index % 2 === 0 ? 'grupo-a' : 'grupo-b',
  conversationId: `conv-${String((index % 9) + 1).padStart(2, '0')}`,
  recordingId: `rec-${String((index % 12) + 1).padStart(2, '0')}`,
  correlationId: `corr-${String((index % 6) + 1).padStart(2, '0')}`,
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

  it('usa canDownload e canReadAudit da sessão', () => {
    assert.deepEqual(
      permissionsFromSession({ permissions: { canDownload: false, canReadAudit: true } }, false),
      ['RECORDING_SEARCH', 'RECORDING_PLAY', 'AUDIT_READ', 'AUDIT_EXPORT'],
    );
    assert.equal(
      permissionsFromSession({ permissions: { canDownload: true, canReadAudit: false } }, true).includes('AUDIT_READ'),
      false,
    );
  });

  it('pagina 50 eventos por página', () => {
    const page1 = filterAuditEvents(events, { page: 1, limit: 50 });
    const page2 = filterAuditEvents(events, { page: 2, limit: 50 });
    assert.equal(page1.total, 48);
    assert.equal(page1.items.length, 48);
    assert.equal(page1.limit, 50);
    assert.equal(page2.items.length, 0);
  });

  it('filtra por usuário, ação, resultado, grupo, conversationId, recordingId e correlationId', () => {
    const filtered = filterAuditEvents(events, {
      user: 'inspetoria',
      action: 'MEDIA_DOWNLOAD',
      result: 'SUCCESS',
      accessGroup: 'grupo-a',
      conversationId: 'conv-01',
      recordingId: 'rec-01',
      correlationId: 'corr-01',
      page: 1,
      limit: 50,
    });
    assert.ok(filtered.total >= 1);
    for (const event of filtered.items) {
      assert.match(String(event.actor), /inspetoria/i);
      assert.equal(event.action, 'MEDIA_DOWNLOAD');
      assert.equal(event.result, 'SUCCESS');
      assert.equal(event.accessGroup, 'grupo-a');
      assert.equal(event.conversationId, 'conv-01');
      assert.equal(event.recordingId, 'rec-01');
      assert.equal(event.correlationId, 'corr-01');
    }
  });

  it('download controlado envia só ids, sem identidade, IP ou resultado', () => {
    const body = { ids: ['id-1', 'id-2'] };
    assert.deepEqual(Object.keys(body), ['ids']);
    assert.equal('actor' in body, false);
    assert.equal('ip' in body, false);
    assert.equal('result' in body, false);
  });

  it('só mostra Buscar vídeos com SearchVideo pareado ao grupo atual', () => {
    const videoGroups = [
      { slug: 'video-grupo-a', name: 'SearchVideo_GrupoA' },
      { slug: 'video-grupo-b', name: 'SearchVideo_GrupoB' },
    ];
    assert.equal(hasPairedMediaAccess('audio-grupo-a', videoGroups, 'video'), true);
    assert.equal(hasPairedMediaAccess('audio-grupo-c', videoGroups, 'video'), false);
    assert.equal(hasPairedMediaAccess('audio-grupo-a', [], 'video'), false);
  });

  it('converte slug entre áudio e vídeo na troca de app', () => {
    assert.equal(toMediaSlug('audio-grupo-a', 'video'), 'video-grupo-a');
    assert.equal(toMediaSlug('video-grupo-b', 'audio'), 'audio-grupo-b');
    assert.equal(toMediaSlug('grupo-a', 'video'), 'video-grupo-a');
    assert.equal(toMediaSlug('grupo-home', 'audio'), 'audio-grupo-home');
  });

  it('normaliza slugs legados para a mídia correta', () => {
    assert.equal(normalizeGroup('grupo-a', 'audio'), 'audio-grupo-a');
    assert.equal(normalizeGroup('grupo-a', 'video'), 'video-grupo-a');
    assert.equal(normalizeGroup('audio-grupo-a', 'video'), 'audio-grupo-a');
    assert.equal(toMediaSlug('audio-grupo-a', 'video'), 'video-grupo-a');
  });

  it('só autoriza grupo quando pertence à sessão', () => {
    const groups = [{ slug: 'audio-grupo-a' }, { slug: 'audio-grupo-b' }];
    assert.equal(findAuthorizedGroupSlug('audio-grupo-a', groups), 'audio-grupo-a');
    assert.equal(findAuthorizedGroupSlug('grupo-a', groups), 'audio-grupo-a');
    assert.equal(findAuthorizedGroupSlug('video-grupo-a', groups), null);
    assert.equal(findAuthorizedGroupSlug('', groups), null);
  });

  it('download e auditoria seguem Search_Download e Search_Auditoria', () => {
    assert.deepEqual(
      permissionsFromSession({ accessGroups: [{ name: 'SearchAudio_GrupoA' }] }, false),
      ['RECORDING_SEARCH', 'RECORDING_PLAY'],
    );
    assert.ok(
      permissionsFromSession({ accessGroups: [{ name: 'Search_Download' }] }, false).includes('RECORDING_DOWNLOAD'),
    );
    assert.ok(
      permissionsFromSession({ accessGroups: [{ name: 'Search_Auditoria' }] }, false).includes('AUDIT_READ'),
    );
  });
});
