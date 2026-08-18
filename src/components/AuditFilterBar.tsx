import { Box, Button, Grid, MenuItem, Stack, TextField } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AUDIT_ACTIONS, type AuditEventsQuery } from '../audit/contract';

export type AuditFilters = {
  start: string;
  end: string;
  user: string;
  action: string;
  result: string;
  accessGroup: string;
  conversationId: string;
  recordingId: string;
  correlationId: string;
};

const emptyFilters: AuditFilters = {
  start: '',
  end: '',
  user: '',
  action: '',
  result: '',
  accessGroup: '',
  conversationId: '',
  recordingId: '',
  correlationId: '',
};

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
      start: values.start || undefined,
      end: values.end || undefined,
      user: values.user.trim() || undefined,
      action: values.action || undefined,
      result: values.result || undefined,
      accessGroup: values.accessGroup.trim() || undefined,
      conversationId: values.conversationId.trim() || undefined,
      recordingId: values.recordingId.trim() || undefined,
      correlationId: values.correlationId.trim() || undefined,
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit(submit)} sx={{ background: 'background.paper', p: 4, borderRadius: 3, boxShadow: 1 }}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Controller
              name="start"
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
              name="end"
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
                  {AUDIT_ACTIONS.map((action) => (
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
            <Controller name="accessGroup" control={control} render={({ field }) => <TextField {...field} label="Grupo" fullWidth />} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Controller name="conversationId" control={control} render={({ field }) => <TextField {...field} label="conversationId" fullWidth />} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Controller name="recordingId" control={control} render={({ field }) => <TextField {...field} label="recordingId" fullWidth />} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Controller name="correlationId" control={control} render={({ field }) => <TextField {...field} label="correlationId" fullWidth />} />
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
