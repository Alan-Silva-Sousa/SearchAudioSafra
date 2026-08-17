import { useEffect, useState, type ReactNode } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Alert, Box, CircularProgress } from '@mui/material'
import RecordingListPage from './pages/RecordingListPage'
import AuditPage from './pages/AuditPage'
import { getAccessContext } from './auth/accessContext'
import { PermissionsProvider } from './hooks/usePermissions'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/audio/api';

function AuthenticatedShell({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    if (!getAccessContext()) {
      setAuthError(true);
      setAuthenticated(false);
      return;
    }
    fetch(`${API_BASE_URL}/auth/session`, { credentials: 'include' })
      .then((response) => {
        if (response.ok) {
          setAuthenticated(true);
          return;
        }
        return fetch(`${API_BASE_URL}/auth/config`, { credentials: 'include' })
          .then((configResponse) => configResponse.json())
          .then((config) => {
            if (config.authMethod === 'genesys' && config.genesysAuthUrl) {
              window.location.assign(config.genesysAuthUrl);
              return;
            }
            setAuthError(true);
            setAuthenticated(false);
          });
      })
      .catch(() => {
        setAuthError(true);
        setAuthenticated(false);
      });
  }, []);

  if (authenticated) {
    return <PermissionsProvider>{children}</PermissionsProvider>;
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 3 }}>
      {authError ? (
        <Alert severity="error">Não foi possível iniciar a autenticação.</Alert>
      ) : (
        <CircularProgress aria-label="Autenticando" />
      )}
    </Box>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthenticatedShell><RecordingListPage /></AuthenticatedShell>} />
      <Route path="/audit" element={<AuthenticatedShell><AuditPage /></AuthenticatedShell>} />
    </Routes>
  );
}
