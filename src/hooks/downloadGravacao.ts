import type { RecordingMeta } from './useRecordings';
import { authenticatedHeaders, getAccessContext } from '../auth/accessContext';
import type { DownloadRequestMeta } from '../audit/contract';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/audio/api';

function downloadQuery(meta: DownloadRequestMeta): URLSearchParams {
  const params = new URLSearchParams({
    downloadKind: meta.kind,
  });
  if (meta.justification) params.set('justification', meta.justification);
  return params;
}

export async function downloadSingleRecording(
  recording: RecordingMeta,
  meta: Omit<DownloadRequestMeta, 'kind' | 'recordingIds'> = {},
): Promise<void> {
  const id = recording.CallIDMaster;
  if (!id) return;
  await downloadSingleById(id, recording.IdOrigem, { justification: meta.justification });
}

async function downloadSingleById(id: string, idOrigem?: string, extra: { justification?: string } = {}): Promise<void> {
  const params = downloadQuery({ kind: 'SINGLE', recordingIds: [id], justification: extra.justification });
  const response = await fetch(`${API_BASE_URL}/audio/download/${id}?${params}`, {
    headers: authenticatedHeaders(),
    credentials: 'include',
  });
  if (!response.ok) throw new Error(`Erro ao baixar áudio: ${response.status}`);
  const disposition = response.headers.get('Content-Disposition') || '';
  const match = disposition.match(/filename="(.+)"/);
  const fileName = match ? match[1] : `${idOrigem || id}.mp3`;
  const blob = await response.blob();
  triggerBrowserDownload(blob, fileName);
}

function downloadAsZip(ids: string[], justification?: string): void {
  const params = downloadQuery({ kind: 'ZIP', recordingIds: ids, justification });
  params.set('accessGroup', getAccessContext());
  ids.forEach((id) => params.append('id', id));
  const link = document.createElement('a');
  link.href = `${API_BASE_URL}/audio/zip/download?${params}`;
  link.download = 'audios.zip';
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  window.setTimeout(() => link.remove(), 60_000);
}

export async function downloadSelectedRecordings(
  ids: string[],
  extra: { justification?: string } = {},
): Promise<void> {
  if (!ids.length) return;
  if (ids.length === 1) {
    await downloadSingleById(ids[0], undefined, extra);
    return;
  }
  downloadAsZip(ids, extra.justification);
}

function triggerBrowserDownload(blob: Blob, fileName: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
