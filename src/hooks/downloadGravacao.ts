import type { RecordingMeta } from './useRecordings';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

/**
 * Dispara o download de um único áudio no navegador, através do
 * backend (GET /api/audio/download/:id). O backend decide como buscar
 * o arquivo (hoje: leitura de disco local; no futuro: S3), então o
 * front nunca precisa saber onde o áudio realmente está.
 */
export async function downloadSingleRecording(recording: RecordingMeta): Promise<void> {
  const id = recording.CallIDMaster;
  if (!id) {
    console.error('[downloadGravacoes] Gravação sem CallIDMaster.');
    return;
  }

  await downloadSingleById(id, recording.IdOrigem);
}

/**
 * Baixa um único áudio a partir do id, sem depender de já ter o
 * objeto RecordingMeta completo em mãos (usado no download em massa
 * quando só 1 item está selecionado).
 */
async function downloadSingleById(id: string, idOrigem?: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/audio/download/${id}`);
    if (!response.ok) {
      throw new Error(`Erro ao baixar áudio: ${response.status}`);
    }

    // Extrai o nome/extensão reais do header enviado pelo backend
    const disposition = response.headers.get('Content-Disposition') || '';
    const match = disposition.match(/filename="(.+)"/);
    const fileName = match ? match[1] : `${idOrigem || id}.mp3`;

    const blob = await response.blob();
    triggerBrowserDownload(blob, fileName);
  } catch (error) {
    console.error('[downloadGravacoes] Erro no download individual:', error);
  }
}

/**
 * Dispara o download de múltiplos áudios em um único arquivo ZIP,
 * montado pelo backend (POST /api/audio/zip).
 */
async function downloadAsZip(ids: string[]): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/audio/zip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });

    if (!response.ok) {
      throw new Error(`Erro ao gerar ZIP: ${response.status}`);
    }

    const blob = await response.blob();
    triggerBrowserDownload(blob, 'gravacoes.zip');
  } catch (error) {
    console.error('[downloadGravacoes] Erro no download em massa:', error);
  }
}

/**
 * Função usada pelo botão "Baixar selecionados". Decide automaticamente:
 * - 1 id selecionado -> baixa o arquivo puro (sem zipar)
 * - 2+ ids selecionados -> baixa um .zip com todos
 */
export async function downloadSelectedRecordings(ids: string[]): Promise<void> {
  if (!ids.length) return;

  if (ids.length === 1) {
    await downloadSingleById(ids[0]);
  } else {
    await downloadAsZip(ids);
  }
}

/**
 * Cria um link temporário e simula o clique para disparar o download
 * do blob no navegador.
 */
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