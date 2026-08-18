import { useEffect, useState, type ReactNode } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Alert, Box, CircularProgress } from '@mui/material'
import RecordingListPage from './pages/RecordingListPage'
import AuditPage from './pages/AuditPage'
import {
  authenticatedHeaders,
  capturePendingGroupFromUrl,
  clearPendingGroup,
  consumePendingGroupIfAuthorized,
  findAuthorizedGroupSlug,
  getPendingGroup,
  readGroupFromUrl,
  setAccessContext,
  syncGroupInUrl,
} from './auth/accessContext'
import { PermissionsProvider } from './hooks/usePermissions'
import { isAudioAccessGroup, type AccessGroup, type SessionResponse } from './audit/contract'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/audio/api';

function resolveSessionGroup(
  groups: AccessGroup[],
  urlGroup: string,
): { slug: string | null; unauthorized: boolean; missingGroup: boolean } {
  if (!groups.length) {
    return { slug: null, unauthorized: false, missingGroup: false };
  }

  if (urlGroup) {
    const fromUrl = findAuthorizedGroupSlug(urlGroup, groups);
    return fromUrl
      ? { slug: fromUrl, unauthorized: false, missingGroup: false }
      : { slug: null, unauthorized: true, missingGroup: false };
  }

  const fromPending = consumePendingGroupIfAuthorized(groups);
  if (fromPending) {
    return { slug: fromPending, unauthorized: false, missingGroup: false };
  }

  if (getPendingGroup()) {
    return { slug: null, unauthorized: true, missingGroup: false };
  }

  return { slug: null, unauthorized: false, missingGroup: true };
}

function AuthenticatedShell({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    capturePendingGroupFromUrl();

    const callbackParams = window.location.hash.startsWith('#/auth/callback?')
      ? new URLSearchParams(window.location.hash.split('?')[1])
      : null;
    const callbackToken = callbackParams?.get('token');
    const callbackError = callbackParams?.get('error');

    if (callbackToken) {
      localStorage.setItem('token', callbackToken);
    } else if (callbackError) {
      setAuthError(callbackError);
      return;
    }

    fetch(`${API_BASE_URL}/auth/session`, {
      headers: authenticatedHeaders(),
      credentials: 'include',
    })
      .then(async (response) => {
        if (response.ok) return response.json() as Promise<SessionResponse>;
        capturePendingGroupFromUrl();
        const configResponse = await fetch(`${API_BASE_URL}/auth/config`, { credentials: 'include' });
        const config = await configResponse.json();
        if (config.authMethod === 'genesys' && config.genesysAuthUrl) {
          window.location.assign(config.genesysAuthUrl);
          return null;
        }
        throw new Error('Não foi possível iniciar a autenticação.');
      })
      .then((data) => {
        if (!data) return;
        const audioGroups = (data.accessGroups || []).filter(isAudioAccessGroup);
        if (!audioGroups.length) {
          setAuthError('Usuário sem grupo de áudio autorizado.');
          return;
        }

        const resolved = resolveSessionGroup(audioGroups, readGroupFromUrl());

        if (resolved.missingGroup) {
          setAuthError('Application URL deve incluir o parâmetro group (ex.: ?group=audio-grupo-a).');
          return;
        }

        if (resolved.unauthorized) {
          clearPendingGroup();
          setAuthError('Grupo de acesso não autorizado.');
          return;
        }

        if (resolved.slug) {
          setAccessContext(resolved.slug);
          syncGroupInUrl(resolved.slug);
          setSession(data);
          return;
        }

        setAuthError('Não foi possível resolver o grupo de acesso.');
      })
      .catch((error: Error) => {
        setAuthError(error.message || 'Não foi possível iniciar a autenticação.');
      });
  }, []);

  if (session) {
    return <PermissionsProvider session={session}>{children}</PermissionsProvider>;
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 3 }}>
      {authError ? (
        <Alert severity="error">{authError}</Alert>
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
      <Route path="/auth/callback" element={<AuthenticatedShell><RecordingListPage /></AuthenticatedShell>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
