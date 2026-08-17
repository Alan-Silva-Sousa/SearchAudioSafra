import { useEffect, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';

export default function DownloadJustificationDialog({
  open,
  kind,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  kind: 'SINGLE' | 'ZIP';
  onCancel: () => void;
  onConfirm: (justification: string) => void;
}) {
  const [justification, setJustification] = useState('');

  useEffect(() => {
    if (open) setJustification('');
  }, [open]);

  return (
    <Dialog open={open} onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>Justificativa do download ({kind === 'ZIP' ? 'ZIP' : 'individual'})</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Justificativa"
          fullWidth
          multiline
          minRows={3}
          value={justification}
          onChange={(event) => setJustification(event.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancelar</Button>
        <Button
          variant="contained"
          disabled={!justification.trim()}
          onClick={() => onConfirm(justification.trim())}
        >
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
