import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AuditFilterBar from '../components/AuditFilterBar';
import useAuditEvents from '../hooks/useAuditEvents';
import { PERMISSIONS, usePermissions } from '../hooks/usePermissions';
import type { AuditEventsQuery } from '../audit/contract';

export default function AuditPage() {
  const navigate = useNavigate();
  const { can, loaded } = usePermissions();
  const { data, loading, mocked, fetchEvents } = useAuditEvents();
  const [query, setQuery] = useState<AuditEventsQuery>({ page: 1, pageSize: 20 });

  useEffect(() => {
    if (loaded && can(PERMISSIONS.AUDIT_READ)) {
      void fetchEvents(query);
    }
  }, [loaded, query, can, fetchEvents]);

  if (!loaded) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!can(PERMISSIONS.AUDIT_READ)) {
    return (
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 5 }}>
        <Container maxWidth={false} sx={{ maxWidth: '90%' }}>
          <Alert severity="error">Você não tem permissão para visualizar a auditoria.</Alert>
          <Button sx={{ mt: 2 }} onClick={() => navigate('/')}>Voltar</Button>
        </Container>
      </Box>
    );
  }

  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 5 }}>
      <Container maxWidth={false} sx={{ maxWidth: '90%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="h4" fontWeight={700} color="primary.main">Auditoria</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {can(PERMISSIONS.AUDIT_EXPORT) && (
              <Button
                variant="contained"
                onClick={() => {
                  const blob = new Blob([JSON.stringify(data.items, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `audit-events-page-${data.page}.json`;
                  link.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Exportar JSON
              </Button>
            )}
            <Button variant="outlined" onClick={() => navigate('/')}>Voltar às gravações</Button>
          </Box>
        </Box>
        {mocked && (
          <Alert severity="info" sx={{ mb: 3 }}>
            API de auditoria ainda não integrada. Exibindo eventos simulados (somente leitura).
          </Alert>
        )}
        <Box sx={{ mb: 4 }}>
          <AuditFilterBar onSubmit={(filters) => setQuery({ ...filters, page: 1, pageSize: data.pageSize })} />
        </Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
        ) : data.items.length ? (
          <Paper>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Data/Hora</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Usuário</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Ação</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Resultado</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Grupo</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>conversationId</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>recordingId</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.items.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>{new Date(event.timestamp).toLocaleString('pt-BR')}</TableCell>
                    <TableCell>{event.actor || '-'}</TableCell>
                    <TableCell>{event.action}</TableCell>
                    <TableCell>{event.result}</TableCell>
                    <TableCell>{event.accessGroup || '-'}</TableCell>
                    <TableCell>{event.conversationId || '-'}</TableCell>
                    <TableCell>{event.recordingId || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={7}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, py: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        disabled={data.page <= 1}
                        onClick={() => setQuery((current) => ({ ...current, page: (current.page || 1) - 1 }))}
                      >
                        Anterior
                      </Button>
                      <Typography fontWeight={700}>Página {data.page} de {totalPages} ({data.total})</Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        disabled={data.page >= totalPages}
                        onClick={() => setQuery((current) => ({ ...current, page: (current.page || 1) + 1 }))}
                      >
                        Próximo
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </Paper>
        ) : (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6">Nenhum evento encontrado</Typography>
          </Paper>
        )}
      </Container>
    </Box>
  );
}
