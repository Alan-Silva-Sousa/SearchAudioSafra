import { useCallback, useState } from 'react';
import { normalizeAuditEvent, type AuditEventsQuery, type AuditEventsResponse } from '../audit/contract';
import { authenticatedHeaders } from '../auth/accessContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/audio/api';

export default function useAuditEvents() {
  const [data, setData] = useState<AuditEventsResponse>({ items: [], total: 0, page: 1, limit: 50 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchEvents = useCallback(async (query: AuditEventsQuery) => {
    setLoading(true);
    setError('');
    const params = new URLSearchParams();
    const payload: AuditEventsQuery = { page: 1, limit: 50, ...query };
    Object.entries(payload).forEach(([key, value]) => {
      if (value === undefined || value === '') return;
      params.set(key, String(value));
    });
    try {
      const response = await fetch(`${API_BASE_URL}/audit/events?${params}`, {
        headers: authenticatedHeaders(),
        credentials: 'include',
      });
      if (response.status === 403) {
        setError('Você não tem permissão para consultar a auditoria.');
        setData({ items: [], total: 0, page: 1, limit: payload.limit || 50 });
        return;
      }
      if (!response.ok) throw new Error(String(response.status));
      const body = await response.json();
      setData({
        items: (body.items || []).map((item: Record<string, unknown>) => normalizeAuditEvent(item)),
        total: Number(body.total || 0),
        page: Number(body.page || payload.page || 1),
        limit: Number(body.limit || payload.limit || 50),
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Falha ao consultar auditoria');
      setData({ items: [], total: 0, page: payload.page || 1, limit: payload.limit || 50 });
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchEvents };
}
