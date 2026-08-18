/**
 * Contrato congelado com a Pessoa 1.
 * O frontend não envia identidade, IP ou resultado.
 */

export const AUDIT_ACTIONS = [
  'LOGIN_SUCCESS',
  'LOGIN_FAILURE',
  'SESSION_EXPIRED',
  'ACCESS_DENIED',
  'RECORDING_SEARCH',
  'RECORDING_DETAILS_VIEW',
  'AUDIO_PLAY',
  'VIDEO_PLAY',
  'MEDIA_DOWNLOAD',
  'ZIP_DOWNLOAD',
  'UNAUTHORIZED_GROUP_ACCESS',
  'UNAUTHORIZED_RECORDING_ACCESS',
  'RATE_LIMIT_EXCEEDED',
  'S3_EXPORT_STARTED',
  'S3_EXPORT_SUCCESS',
  'S3_EXPORT_FAILURE',
  'S3_RECONCILIATION_SUCCESS',
  'S3_RECONCILIATION_FAILURE',
  'PURGE_REQUESTED',
  'PURGE_BLOCKED',
  'PURGE_SUCCESS',
  'PURGE_FAILURE',
  'AUDIT_REPORT_VIEW',
  'AUDIT_REPORT_EXPORT',
] as const;

export const PERMISSIONS = {
  RECORDING_SEARCH: 'RECORDING_SEARCH',
  RECORDING_PLAY: 'RECORDING_PLAY',
  RECORDING_DOWNLOAD: 'RECORDING_DOWNLOAD',
  AUDIT_READ: 'AUDIT_READ',
  AUDIT_EXPORT: 'AUDIT_EXPORT',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
export type AuditResult = 'SUCCESS' | 'FAILURE' | 'BLOCKED';
export type AuditAction = (typeof AUDIT_ACTIONS)[number] | string;

export interface AccessGroup {
  genesysGroupId: string;
  slug: string;
  name: string;
  divisionLabel: string;
  divisionIds: string[];
}

export interface SessionPermissions {
  canDownload?: boolean;
  canReadAudit?: boolean;
}

export interface SessionResponse {
  authenticated: boolean;
  user?: Record<string, unknown>;
  accessGroups?: AccessGroup[];
  permissions?: SessionPermissions;
}

export interface AuditEvent {
  id: string | number;
  timestamp: string;
  actor?: string;
  action: AuditAction;
  result: AuditResult | string;
  accessGroup?: string;
  conversationId?: string;
  recordingId?: string;
  correlationId?: string;
  mediaKind?: 'audio' | 'video';
}

export interface AuditEventsQuery {
  start?: string;
  end?: string;
  user?: string;
  action?: string;
  result?: string;
  accessGroup?: string;
  conversationId?: string;
  recordingId?: string;
  correlationId?: string;
  page?: number;
  limit?: number;
}

export interface AuditEventsResponse {
  items: AuditEvent[];
  total: number;
  page: number;
  limit: number;
}

export function isAudioAccessGroup(group: AccessGroup): boolean {
  if (/^audio-/i.test(group.slug || '')) return true;
  return /^searchaudio(_|-)/i.test(group.name || '');
}

export function isVideoAccessGroup(group: AccessGroup): boolean {
  if (/^video-/i.test(group.slug || '')) return true;
  return /^searchvideo(_|-)/i.test(group.name || '');
}

export function isDownloadAccessGroup(group: AccessGroup): boolean {
  return /^search_download$/i.test(group.name || '');
}

export function isAuditAccessGroup(group: AccessGroup): boolean {
  return /^search_auditoria$/i.test(group.name || '');
}

export function permissionsFromSession(
  session: SessionResponse,
  canReadAuditFallback: boolean,
): Permission[] {
  const groups = session.accessGroups || [];
  const canDownload = session.permissions?.canDownload ?? groups.some(isDownloadAccessGroup);
  const canReadAudit =
    session.permissions?.canReadAudit ??
    (groups.some(isAuditAccessGroup) || canReadAuditFallback);
  const permissions: Permission[] = [PERMISSIONS.RECORDING_SEARCH, PERMISSIONS.RECORDING_PLAY];
  if (canDownload) permissions.push(PERMISSIONS.RECORDING_DOWNLOAD);
  if (canReadAudit) {
    permissions.push(PERMISSIONS.AUDIT_READ, PERMISSIONS.AUDIT_EXPORT);
  }
  return permissions;
}

export function normalizeAuditEvent(raw: Record<string, unknown>): AuditEvent {
  return {
    id: (raw.id as string | number) ?? '',
    timestamp: String(raw.occurred_at || raw.timestamp || ''),
    actor: String(raw.user_login || raw.actor || ''),
    action: String(raw.action || ''),
    result: String(raw.result || ''),
    accessGroup: (raw.access_group || raw.accessGroup) as string | undefined,
    conversationId: (raw.conversation_id || raw.conversationId) as string | undefined,
    recordingId: (raw.recording_id || raw.recordingId) as string | undefined,
    correlationId: (raw.correlation_id || raw.correlationId) as string | undefined,
    mediaKind: raw.media_kind as AuditEvent['mediaKind'] || raw.mediaKind as AuditEvent['mediaKind'],
  };
}
