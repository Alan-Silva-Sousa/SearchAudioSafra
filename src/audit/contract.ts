/**
 * Contrato esperado da Pessoa 1 (GET /audit/events, GET /audit/permissions).
 * O frontend simula a API até a integração. Não envia identidade, IP ou resultado.
 */

export const PERMISSIONS = {
  RECORDING_SEARCH: 'RECORDING_SEARCH',
  RECORDING_PLAY: 'RECORDING_PLAY',
  RECORDING_DOWNLOAD: 'RECORDING_DOWNLOAD',
  AUDIT_READ: 'AUDIT_READ',
  AUDIT_EXPORT: 'AUDIT_EXPORT',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export type AuditResult = 'SUCCESS' | 'FAILURE' | 'BLOCKED';

export type AuditAction =
  | 'LOGIN'
  | 'SEARCH'
  | 'PLAY'
  | 'DOWNLOAD'
  | 'DOWNLOAD_ZIP'
  | 'AUDIT_EXPORT'
  | 'S3_EXPORT_STARTED'
  | 'S3_EXPORT_SUCCESS'
  | 'S3_EXPORT_FAILURE'
  | 'S3_RECONCILIATION_SUCCESS'
  | 'S3_RECONCILIATION_FAILURE'
  | 'PURGE_REQUESTED'
  | 'PURGE_BLOCKED'
  | 'PURGE_SUCCESS'
  | 'PURGE_FAILURE';

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor?: string;
  action: AuditAction | string;
  result: AuditResult;
  accessGroup?: string;
  conversationId?: string;
  recordingId?: string;
  downloadKind?: 'SINGLE' | 'ZIP';
  justification?: string;
}

export interface AuditEventsQuery {
  from?: string;
  to?: string;
  user?: string;
  action?: string;
  result?: string;
  group?: string;
  conversationId?: string;
  recordingId?: string;
  page?: number;
  pageSize?: number;
}

export interface AuditEventsResponse {
  items: AuditEvent[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AuditPermissionsResponse {
  permissions: Permission[];
  downloadJustificationRequired?: boolean;
}

/** Payload de download enviado ao backend. Sem identidade, IP ou resultado. */
export interface DownloadRequestMeta {
  kind: 'SINGLE' | 'ZIP';
  recordingIds: string[];
  justification?: string;
}
