import { useState, useEffect } from 'react'
import {
  Paper, Table, TableBody, TableHead, TableRow, TableCell, TableFooter, Box, Button, Checkbox, CircularProgress
} from '@mui/material'
import RecordingRow from './RecordingRow'
import type { RecordingMeta } from '../hooks/useRecordings'
import { downloadSelectedRecordings } from '../hooks/downloadGravacao'
import DownloadJustificationDialog from './DownloadJustificationDialog'
import { PERMISSIONS, usePermissions } from '../hooks/usePermissions'

const rowsPerPage = 35;

export default function RecordingTable({
  recordings,
  selectedIds,
  setSelectedIds,
}: {
  recordings: RecordingMeta[]
  maxWidth?: string
  selectedIds: string[]
  setSelectedIds: (ids: string[]) => void
}) {

  const { can, downloadJustificationRequired } = usePermissions();
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false);
  const [justificationOpen, setJustificationOpen] = useState(false);

  useEffect(() => { setPage(0) }, [recordings])

  const totalPages = Math.ceil(recordings.length / rowsPerPage)

  const paginated = recordings.slice(page * rowsPerPage, (page + 1) * rowsPerPage)

  // Checkbox master
  const allSelected = (paginated ?? []).length > 0 && (paginated ?? []).every(a => selectedIds.includes(a.CallIDMaster));
  const isIndeterminate = paginated.some(a => selectedIds.includes(a.CallIDMaster)) && !allSelected

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const toAdd = paginated.map(a => a.CallIDMaster).filter(CallIDMaster => !selectedIds.includes(CallIDMaster))
      setSelectedIds([...selectedIds, ...toAdd])
    } else {
      setSelectedIds(selectedIds.filter(CallIDMaster => !paginated.some(a => a.CallIDMaster === CallIDMaster)))
    }
  }

  const handleCheck = (CallIDMaster: string, checked: boolean) => {
    if (checked) setSelectedIds([...selectedIds, CallIDMaster])
    else setSelectedIds(selectedIds.filter(x => x !== CallIDMaster))
  }

  async function runDownload() {
    setLoading(true);
    try {
      await downloadSelectedRecordings(selectedIds);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownloadSelected() {
    if (!can(PERMISSIONS.RECORDING_DOWNLOAD) || !selectedIds.length) return;
    if (downloadJustificationRequired) {
      setJustificationOpen(true);
      return;
    }
    await runDownload();
  }

  if (!recordings.length) return null

  return (
    <Paper sx={{ width: '100%', mx: 'auto' }}>
      {/* Botão de download em lote */}
      {can(PERMISSIONS.RECORDING_DOWNLOAD) && (
      <Box sx={{ p: 2, pb: 0, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          size="small"
          disabled={selectedIds.length === 0 || loading}
          onClick={handleDownloadSelected}
          sx={{
            fontWeight: 700,
            backgroundColor: selectedIds.length === 0 ? 'divider' : 'primary.main',
            color: selectedIds.length === 0 ? 'text.secondary' : 'primary.contrastText',
            pointerEvents: selectedIds.length === 0 ? 'none' : 'auto',
            '&:hover': {
              backgroundColor: selectedIds.length === 0 ? 'divider' : 'primary.dark'
            }
          }}
        >
          {loading ? (
            <CircularProgress size={24} sx={{ color: 'primary.contrastText' }} />
          ) : (
            <>Baixar selecionados ({selectedIds.length})</>
          )}
        </Button>
      </Box>
      )}
      <DownloadJustificationDialog
        open={justificationOpen}
        kind={selectedIds.length > 1 ? 'ZIP' : 'SINGLE'}
        onCancel={() => setJustificationOpen(false)}
        onConfirm={(justification) => {
          setJustificationOpen(false);
          void runDownload();
        }}
      />

      {/* Container para inverter a posição da barra de rolagem */}
      <Box sx={{
        overflowX: 'auto',
        transform: 'rotateX(180deg)',
        width: '100%'
      }}>
        <Box sx={{ transform: 'rotateX(180deg)' }}>
          <Table>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                checked={allSelected}
                indeterminate={isIndeterminate}
                onChange={e => handleSelectAll(e.target.checked)}
                color="primary"
              />
            </TableCell>
            <TableCell sx={{ color: 'primary.main', fontWeight: 700 }}></TableCell>
            <TableCell sx={{ color: 'primary.main', fontWeight: 700 }}>Data/Hora</TableCell>
            <TableCell sx={{ color: 'primary.main', fontWeight: 700 }}>Telefone Cliente</TableCell>
            <TableCell sx={{ color: 'primary.main', fontWeight: 700 }}>Telefone Destino</TableCell>
            <TableCell sx={{ color: 'primary.main', fontWeight: 700 }}>CPF/CNPJ</TableCell>
            <TableCell sx={{ color: 'primary.main', fontWeight: 700 }}>Skill/Fila</TableCell>
            <TableCell sx={{ color: 'primary.main', fontWeight: 700 }}>Ambiente</TableCell>
            <TableCell sx={{ color: 'primary.main', fontWeight: 700 }}>Duração</TableCell>
            <TableCell sx={{ color: 'primary.main', fontWeight: 700 }}>Formato</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginated.map(a => (
            <RecordingRow
              key={a.CallIDMaster}
              recording={a}
              checked={selectedIds.includes(a.CallIDMaster)}
              onCheck={handleCheck}
            />
          ))}
        </TableBody>
        {recordings.length > rowsPerPage && (
          <TableFooter>
            <TableRow>
              <TableCell colSpan={10} sx={{ p: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
                  <Button
                    onClick={() => setPage((p) => Math.max(p - 1, 0))}
                    disabled={page === 0}
                    size="small"
                    variant="outlined"
                    sx={{ minWidth: 90, fontWeight: 700 }}
                  >
                    Anterior
                  </Button>
                  <Box sx={{ fontWeight: 700, color: 'primary.main', px: 1 }}>
                    Página {page + 1} de {totalPages}
                  </Box>
                  <Button
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
                    disabled={page >= totalPages - 1}
                    size="small"
                    variant="outlined"
                    sx={{ minWidth: 90, fontWeight: 700 }}
                  >
                    Próximo
                  </Button>
                </Box>
              </TableCell>
            </TableRow>
          </TableFooter>
        )}
          </Table>
        </Box>
      </Box>
    </Paper>
  )
}
