import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { PERMISSIONS, isAudioAccessGroup, isVideoAccessGroup, permissionsFromSession, type AccessGroup, type Permission, type SessionResponse } from '../audit/contract';
import { authenticatedHeaders, findAuthorizedGroupSlug, getAccessContext, hasPairedMediaAccess, setAccessContext, syncGroupInUrl } from '../auth/accessContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/audio/api';

interface PermissionsState {
  permissions: Permission[];
  accessGroups: AccessGroup[];
  canAccessAudio: boolean;
  canAccessVideo: boolean;
  downloadJustificationRequired: boolean;
  loaded: boolean;
  can: (permission: Permission) => boolean;
  setGroup: (slug: string) => void;
}

const PermissionsContext = createContext<PermissionsState>({
  permissions: [],
  accessGroups: [],
  canAccessAudio: false,
  canAccessVideo: false,
  downloadJustificationRequired: false,
  loaded: false,
  can: () => false,
  setGroup: () => undefined,
});

async function probeAuditRead(signal: AbortSignal): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/audit/events?page=1&limit=1`, {
    headers: authenticatedHeaders(),
    credentials: 'include',
    signal,
  });
  return response.ok;
}

export function PermissionsProvider({
  children,
  session,
}: {
  children: ReactNode;
  session: SessionResponse;
}) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [accessGroups, setAccessGroups] = useState<AccessGroup[]>(session.accessGroups || []);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const groups = (session.accessGroups || []).filter(isAudioAccessGroup);
    setAccessGroups(groups);
    const current = getAccessContext();
    if (current) {
      const slug = findAuthorizedGroupSlug(current, groups);
      if (slug) {
        setAccessContext(slug);
        syncGroupInUrl(slug);
      }
    }

    const explicit = session.permissions?.canReadAudit;
    const resolve = async () => {
      const canReadAudit = explicit ?? (await probeAuditRead(controller.signal).catch(() => false));
      if (controller.signal.aborted) return;
      setPermissions(permissionsFromSession(session, canReadAudit));
      setLoaded(true);
    };
    void resolve();
    return () => controller.abort();
  }, [session]);

  const value = useMemo<PermissionsState>(
    () => {
      const currentSlug = getAccessContext();
      const videoGroups = (session.accessGroups || []).filter(isVideoAccessGroup);
      return {
      permissions,
      accessGroups,
      canAccessAudio: (session.accessGroups || []).some(isAudioAccessGroup),
      canAccessVideo: hasPairedMediaAccess(currentSlug, videoGroups, 'video'),
      downloadJustificationRequired: false,
      loaded,
      can: (permission) => permissions.includes(permission),
      setGroup: (slug) => {
        setAccessContext(slug);
        syncGroupInUrl(slug);
        window.location.assign(`${window.location.pathname}${slug ? `?group=${encodeURIComponent(slug)}` : ''}${window.location.hash.split('?')[0] || window.location.hash}`);
      },
    };
    },
    [permissions, accessGroups, loaded, session],
  );

  return <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>;
}

export function usePermissions() {
  return useContext(PermissionsContext);
}

export { PERMISSIONS };
