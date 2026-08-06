import type { RecordingMeta } from './useRecordings';
import { authenticatedHeaders, getAccessContext } from '../auth/accessContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/audio/api';

export async function downloadSingleRecording(recording: RecordingMeta): Promise<void> {
  const id = recording.CallIDMaster;
  if (!id) {
    console.error('[downloadGravacoes] Gravação sem CallIDMaster.');
    return;
  }

  await downloadSingleById(id, recording.IdOrigem);
}

async function downloadSingleById(id: string, idOrigem?: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/audio/download/${id}`, {
      headers: authenticatedHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Erro ao baixar áudio: ${response.status}`);
    }

    const disposition = response.headers.get('Content-Disposition') || '';
    const match = disposition.match(/filename="(.+)"/);
    const fileName = match ? match[1] : `${idOrigem || id}.mp3`;

    const blob = await response.blob();
    triggerBrowserDownload(blob, fileName);
  } catch (error) {
    console.error('[downloadGravacoes] Erro no download individual:', error);
  }
}

function downloadAsZip(ids: string[]): void {
  const params = new URLSearchParams({ accessGroup: getAccessContext() });
  ids.forEach((id) => params.append('id', id));

  const link = document.createElement('a');
  link.href = `${API_BASE_URL}/audio/zip/download?${params}`;
  link.download = 'audios.zip';
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  window.setTimeout(() => link.remove(), 60_000);
}

export async function downloadSelectedRecordings(ids: string[]): Promise<void> {
  if (!ids.length) return;

  if (ids.length === 1) {
    await downloadSingleById(ids[0]);
  } else {
    downloadAsZip(ids);
  }
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
