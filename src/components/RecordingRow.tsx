import { Collapse, IconButton, TableCell, TableRow, Box, Typography, Stack, Tooltip, Checkbox, Button, Grid } from '@mui/material'
import { KeyboardArrowDown, KeyboardArrowUp, Download } from '@mui/icons-material'
import { useState } from 'react'
import type { RecordingMeta } from '../hooks/useRecordings'
import { downloadSingleRecording } from '../hooks/downloadGravacao';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface Props {
  recording: RecordingMeta
  checked: boolean
  onCheck: (id: string, checked: boolean) => void
}

export default function RecordingRow({ recording, checked, onCheck }: Props) {

  const [open, setOpen] = useState(false);

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

  function formatContentType(ct: string | null): string {
    if (!ct) return '-';
    // "audio/mpeg" → "MPEG", "audio/wav" → "WAV", "audio/opus" → "OPUS"
    const parts = ct.split('/');
    return (parts[1] || ct).toUpperCase();
  }

  function formatDuration(seconds: number | bigint): string {
    const totalSeconds = Number(seconds);
    if (!totalSeconds || totalSeconds <= 0) return '-';
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

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
          {new Date(recording.RecordStart).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </TableCell>
        <TableCell sx={{ color: 'primary.main' }}>{recording.ANI || '-'}</TableCell>
        <TableCell sx={{ color: 'primary.main' }}>{recording.DNIS || '-'}</TableCell>
        <TableCell sx={{ color: 'primary.main' }}>{recording.Username || '-'}</TableCell>
        <TableCell sx={{ color: 'primary.main' }}>{recording.AgentLogin || '-'}</TableCell>
        <TableCell sx={{ color: 'primary.main' }}>{recording.Campaignname || '-'}</TableCell>
        <TableCell sx={{ color: 'primary.main' }}>{formatDuration(recording.RecordDuration)}</TableCell>
        <TableCell sx={{ color: 'primary.main' }}>{formatFileSize(recording.DestinationFileSize)}</TableCell>
        <TableCell sx={{ color: 'primary.main' }}>{formatContentType(recording.ContentType)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={11} sx={{ bgcolor: 'background.default', p: 0, border: 0, borderTop: '1px solid', borderColor: 'divider' }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              alignItems: 'flex-start'
            }}>
              {/* Player de áudio - alterando para simular download via endereço, como sera na S3 da aws*/} 
              <audio
                controls
                style={{ borderRadius: 12, maxWidth: '100%', width: '100%' }}
              >
                <source
                  src={`${API_BASE_URL}/audio/play/${recording.CallIDMaster}`}
                  type="audio/mpeg"
                />
                Seu navegador não suporta o elemento de áudio.
              </audio>

              {/* Grid com informações da chamada */}
              <Grid container spacing={2} sx={{ width: '100%', mt: 1 }}>
                {/* Informações de telefone */}
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>ANI:</strong> {recording.ANI || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>DNIS:</strong> {recording.DNIS || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Nome do Agente:</strong> {recording.Username || '-'}
                  </Typography>
                </Grid>

                {/* Informações do agente */}
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Login do Agente:</strong> {recording.AgentLogin || '-'}
                  </Typography>
                </Grid>
                
                {/* Informações de cliente */}
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>CPF:</strong> {recording.CPF || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>CNPJ:</strong> {recording.CNPJ || '-'}
                  </Typography>
                </Grid>

                {/* Informações bancárias */}
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Agência:</strong> {recording.AGENCIA || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Conta:</strong> {recording.CONTA || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>EC:</strong> {recording.EC || '-'}
                  </Typography>
                </Grid>

                {/* Informações de contrato */}
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Contrato:</strong> {recording.CONTRATO || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Protocolo:</strong> {recording.PROTOCOLO || '-'}
                  </Typography>
                </Grid>
              </Grid>

              {/* Formato do áudio */}
              <Typography variant="body2" color="text.secondary">
                <strong>Formato:</strong> {recording.ContentType || 'WAV'}
              </Typography>

              {/* Duração do áudio */}
              <Typography variant="body2" color="text.secondary">
                <strong>Duração:</strong> {formatDuration(recording.RecordDuration)}
              </Typography>

              {/* Tamanho do arquivo */}
              <Typography variant="body2" color="text.secondary">
                <strong>Tamanho:</strong> {formatFileSize(recording.DestinationFileSize)}
              </Typography>

              {/* Botões de download/exportação */}
              <Stack direction="row" spacing={1}>
                <Tooltip title="Download do áudio">
                  <Button
                    color="primary"
                    startIcon={<Download />}
                  >
                  </Button>
                </Tooltip>
              </Stack>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  )
}