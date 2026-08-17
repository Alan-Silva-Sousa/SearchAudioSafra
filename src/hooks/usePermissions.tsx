import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { PERMISSIONS, type Permission } from '../audit/contract';
import { mockJustificationRequired, mockPermissions } from '../audit/mock';
import { authenticatedHeaders } from '../auth/accessContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/audio/api';

interface PermissionsState {
  permissions: Permission[];
  downloadJustificationRequired: boolean;
  loaded: boolean;
  can: (permission: Permission) => boolean;
}

const PermissionsContext = createContext<PermissionsState>({
  permissions: [],
  downloadJustificationRequired: false,
  loaded: false,
  can: () => false,
});

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [downloadJustificationRequired, setDownloadJustificationRequired] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_BASE_URL}/audit/permissions`, {
      headers: authenticatedHeaders(),
      credentials: 'include',
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(String(response.status));
        return response.json();
      })
      .then((data) => {
        setPermissions(Array.isArray(data.permissions) ? data.permissions : []);
        setDownloadJustificationRequired(Boolean(data.downloadJustificationRequired));
      })
      .catch(() => {
        setPermissions(mockPermissions());
        setDownloadJustificationRequired(mockJustificationRequired());
      })
      .finally(() => setLoaded(true));
    return () => controller.abort();
  }, []);

  const value = useMemo<PermissionsState>(
    () => ({
      permissions,
      downloadJustificationRequired,
      loaded,
      can: (permission) => permissions.includes(permission),
    }),
    [permissions, downloadJustificationRequired, loaded],
  );

  return <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>;
}

export function usePermissions() {
  return useContext(PermissionsContext);
}

export { PERMISSIONS };
