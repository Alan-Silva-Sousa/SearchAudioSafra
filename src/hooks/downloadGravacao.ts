import type { RecordingMeta } from './useRecordings';
import { authenticatedHeaders } from '../auth/accessContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/audio/api';

export async function downloadSingleRecording(recording: RecordingMeta): Promise<void> {
  const id = recording.CallIDMaster;
  if (!id) return;
  await downloadSingleById(id, recording.IdOrigem);
}

async function downloadSingleById(id: string, idOrigem?: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/audio/download/${encodeURIComponent(id)}`, {
    headers: authenticatedHeaders(),
    credentials: 'include',
  });
  if (response.status === 403) throw new Error('Permissão de download obrigatória');
  if (!response.ok) throw new Error(`Erro ao baixar áudio: ${response.status}`);
  const disposition = response.headers.get('Content-Disposition') || '';
  const match = disposition.match(/filename="(.+)"/);
  triggerBrowserDownload(await response.blob(), match ? match[1] : `${idOrigem || id}.mp3`);
}

async function downloadAsZip(ids: string[]): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/audio/zip`, {
    method: 'POST',
    headers: authenticatedHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify({ ids }),
  });
  if (response.status === 403) throw new Error('Permissão de download obrigatória');
  if (!response.ok) throw new Error(`Erro ao baixar ZIP: ${response.status}`);
  triggerBrowserDownload(await response.blob(), 'audios.zip');
}

export async function downloadSelectedRecordings(ids: string[]): Promise<void> {
  if (!ids.length) return;
  if (ids.length === 1) {
    await downloadSingleById(ids[0]);
    return;
  }
  await downloadAsZip(ids);
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
