import { Collapse, IconButton, TableCell, TableRow, Box, Typography, Stack, Tooltip, Checkbox, Button, Grid } from '@mui/material'
import { KeyboardArrowDown, KeyboardArrowUp, Download } from '@mui/icons-material'
import { useEffect, useState } from 'react'
import type { RecordingMeta } from '../hooks/useRecordings'
import { downloadSingleRecording } from '../hooks/downloadGravacao';
import { authenticatedHeaders } from '../auth/accessContext';
import DownloadJustificationDialog from './DownloadJustificationDialog';
import { PERMISSIONS, usePermissions } from '../hooks/usePermissions';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/audio/api';

interface Props {
  recording: RecordingMeta
  checked: boolean
  onCheck: (id: string, checked: boolean) => void
}

function participantDataEntries(data: Record<string, unknown> | undefined) {
  return Object.entries(data || {})
    .filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== '')
    .sort(([left], [right]) => left.localeCompare(right, 'pt-BR'));
}

function participantDataValue(value: unknown): string {
  return typeof value === 'object' ? JSON.stringify(value) : String(value);
}

function participantValue(data: Record<string, unknown> | undefined, ...keys: string[]): string {
  const entries = Object.entries(data || {});
  for (const key of keys) {
    const entry = entries.find(([name]) => name.trim().toLowerCase() === key.toLowerCase());
    if (entry && entry[1] !== null && entry[1] !== undefined && String(entry[1]).trim()) {
      return String(entry[1]).trim();
    }
  }
  return '';
}

function AuthorizedAudio({ recording }: { recording: RecordingMeta }) {
  const [source, setSource] = useState<string>();

  useEffect(() => {
    const controller = new AbortController();
    let objectUrl: string | undefined;
    fetch(`${API_BASE_URL}/audio/play/${recording.CallIDMaster}`, {
      headers: authenticatedHeaders(),
      credentials: 'include',
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error(`Player indisponível: ${response.status}`);
        return response.blob();
      })
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        setSource(objectUrl);
      })
      .catch((error) => {
        if (error.name !== 'AbortError') console.error(error);
      });
    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [recording.CallIDMaster]);

  return <audio controls src={source} style={{ borderRadius: 8, maxWidth: '100%', width: '100%' }} />;
}

export default function RecordingRow({ recording, checked, onCheck }: Props) {

  const { can, downloadJustificationRequired } = usePermissions();
  const [open, setOpen] = useState(false);
  const [justificationOpen, setJustificationOpen] = useState(false);

  function handleOpenRow() {
    setOpen(o => !o);
  }

  function formatFileSize(bytes: number | bigint | null): string {
    const n = Number(bytes);
    if (!n || n <= 0) return '-';
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  }

  function formatFileExtension(ext: string | null): string {
    if (!ext) return '-';
    return ext.toUpperCase();
  }

  function formatDuration(seconds: number | bigint): string {
    const totalSeconds = Number(seconds);
    if (!totalSeconds || totalSeconds <= 0) return '-';
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  const participantData = recording.ParticipantData;
  const startTime = participantValue(participantData, 'Hora Inicio') || recording.RecordStart;
  const customerPhone = participantValue(participantData, 'Telefone Cliente', 'telefone') || recording.ANI?.replace(/^tel:\+?/, '');
  const destinationPhone = participantValue(participantData, 'Telefone Destino') || recording.DNIS?.replace(/^tel:\+?/, '');
  const document = participantValue(participantData, 'Doc Cliente', 'doc_cliente', 'CPF', 'CNPJ');
  const skill = participantValue(participantData, 'skill', 'transfer_filas');
  const environment = participantValue(participantData, 'Ambiente');

  return (
    <>
      <TableRow hover>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            checked={checked}
            onChange={e => onCheck(recording.CallIDMaster, e.target.checked)}
          />
        </TableCell>
        <TableCell>
          <IconButton onClick={handleOpenRow} size="small" color="primary">
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell sx={{ color: 'primary.main' }}>
          {new Date(startTime).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </TableCell>
        <TableCell sx={{ color: 'primary.main' }}>{customerPhone || '-'}</TableCell>
        <TableCell sx={{ color: 'primary.main' }}>{destinationPhone || '-'}</TableCell>
        <TableCell sx={{ color: 'primary.main' }}>{document || '-'}</TableCell>
        <TableCell sx={{ color: 'primary.main' }}>{skill || '-'}</TableCell>
        <TableCell sx={{ color: 'primary.main' }}>{environment || '-'}</TableCell>
        <TableCell sx={{ color: 'primary.main' }}>{formatDuration(recording.RecordDuration)}</TableCell>
        <TableCell sx={{ color: 'primary.main' }}>{formatFileExtension(recording.FileExtension)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={10} sx={{ bgcolor: 'background.default', p: 0, border: 0, borderTop: '1px solid', borderColor: 'divider' }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              alignItems: 'flex-start'
            }}>
              {/* O backend valida a sessão antes de entregar a mídia. */}
              {can(PERMISSIONS.RECORDING_PLAY) ? (
                <AuthorizedAudio recording={recording} />
              ) : (
                <Typography variant="body2" color="text.secondary">Reprodução não autorizada.</Typography>
              )}

              {participantDataEntries(recording.ParticipantData).length > 0 && (
                <Box sx={{ width: '100%', mt: 1 }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                    Participant Data
                  </Typography>
                  <Grid container spacing={2}>
                    {participantDataEntries(recording.ParticipantData).map(([key, value]) => (
                      <Grid item xs={12} md={key.toUpperCase().includes('CDR') ? 12 : 6} key={key}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}
                        >
                          <strong>{key}:</strong> {participantDataValue(value)}
                        </Typography>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              <Typography variant="body2" color="text.secondary">
                <strong>Formato:</strong> {formatFileExtension(recording.FileExtension)}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                <strong>Duração:</strong> {formatDuration(recording.RecordDuration)}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                <strong>Tamanho:</strong> {formatFileSize(recording.DestinationFileSize)}
              </Typography>

              {can(PERMISSIONS.RECORDING_DOWNLOAD) && (
              <Stack direction="row" spacing={1}>
                <Tooltip title="Download do áudio">
                  <Button
                    color="primary"
                    startIcon={<Download />}
                    onClick={() => {
                      if (downloadJustificationRequired) setJustificationOpen(true);
                      else void downloadSingleRecording(recording);
                    }}
                  >
                  </Button>
                </Tooltip>
              </Stack>
              )}
              <DownloadJustificationDialog
                open={justificationOpen}
                kind="SINGLE"
                onCancel={() => setJustificationOpen(false)}
                onConfirm={(justification) => {
                  setJustificationOpen(false);
                  void downloadSingleRecording(recording, { justification });
                }}
              />
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  )
}
