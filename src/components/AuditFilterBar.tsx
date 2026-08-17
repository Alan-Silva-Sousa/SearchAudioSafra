import { Box, Button, Grid, MenuItem, Stack, TextField } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { AuditEventsQuery } from '../audit/contract';

export type AuditFilters = {
  from: string;
  to: string;
  user: string;
  action: string;
  result: string;
  group: string;
  conversationId: string;
  recordingId: string;
};

const emptyFilters: AuditFilters = {
  from: '',
  to: '',
  user: '',
  action: '',
  result: '',
  group: '',
  conversationId: '',
  recordingId: '',
};

const ACTIONS = [
  'LOGIN',
  'SEARCH',
  'PLAY',
  'DOWNLOAD',
  'DOWNLOAD_ZIP',
  'AUDIT_EXPORT',
  'S3_EXPORT_STARTED',
  'S3_EXPORT_SUCCESS',
  'S3_EXPORT_FAILURE',
  'S3_RECONCILIATION_SUCCESS',
  'S3_RECONCILIATION_FAILURE',
  'PURGE_REQUESTED',
  'PURGE_BLOCKED',
  'PURGE_SUCCESS',
  'PURGE_FAILURE',
];

function parseDate(value?: string) {
  return value ? parse(value, 'yyyy-MM-dd', new Date()) : null;
}

export default function AuditFilterBar({
  onSubmit,
}: {
  onSubmit: (filters: AuditEventsQuery) => void;
}) {
  const { control, handleSubmit, reset } = useForm<AuditFilters>({ defaultValues: emptyFilters });

  const submit = (values: AuditFilters) => {
    onSubmit({
      from: values.from || undefined,
      to: values.to || undefined,
      user: values.user.trim() || undefined,
      action: values.action || undefined,
      result: values.result || undefined,
      group: values.group.trim() || undefined,
      conversationId: values.conversationId.trim() || undefined,
      recordingId: values.recordingId.trim() || undefined,
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit(submit)} sx={{ background: 'background.paper', p: 4, borderRadius: 3, boxShadow: 1 }}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Controller
              name="from"
              control={control}
              render={({ field }) => (
                <DesktopDatePicker
                  label="Data inicial"
                  format="yyyy-MM-dd"
                  value={parseDate(field.value)}
                  onChange={(value) => field.onChange(value ? value.toISOString().slice(0, 10) : '')}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Controller
              name="to"
              control={control}
              render={({ field }) => (
                <DesktopDatePicker
                  label="Data final"
                  format="yyyy-MM-dd"
                  value={parseDate(field.value)}
                  onChange={(value) => field.onChange(value ? value.toISOString().slice(0, 10) : '')}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Controller name="user" control={control} render={({ field }) => <TextField {...field} label="Usuário" fullWidth />} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Controller
              name="action"
              control={control}
              render={({ field }) => (
                <TextField {...field} select label="Ação" fullWidth>
                  <MenuItem value="">Todas</MenuItem>
                  {ACTIONS.map((action) => (
                    <MenuItem key={action} value={action}>{action}</MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Controller
              name="result"
              control={control}
              render={({ field }) => (
                <TextField {...field} select label="Resultado" fullWidth>
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="SUCCESS">SUCCESS</MenuItem>
                  <MenuItem value="FAILURE">FAILURE</MenuItem>
                  <MenuItem value="BLOCKED">BLOCKED</MenuItem>
                </TextField>
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Controller name="group" control={control} render={({ field }) => <TextField {...field} label="Grupo" fullWidth />} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Controller name="conversationId" control={control} render={({ field }) => <TextField {...field} label="conversationId" fullWidth />} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Controller name="recordingId" control={control} render={({ field }) => <TextField {...field} label="recordingId" fullWidth />} />
          </Grid>
        </Grid>
      </LocalizationProvider>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 3 }}>
        <Button type="submit" variant="contained" sx={{ fontWeight: 700 }}>Filtrar</Button>
        <Button type="button" variant="outlined" onClick={() => { reset(emptyFilters); onSubmit({}); }}>Limpar</Button>
      </Stack>
    </Box>
  );
}
