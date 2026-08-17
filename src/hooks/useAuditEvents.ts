import { useCallback, useState } from 'react';
import type { AuditEventsQuery, AuditEventsResponse } from '../audit/contract';
import { mockAuditEvents } from '../audit/mock';
import { authenticatedHeaders } from '../auth/accessContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/audio/api';

export default function useAuditEvents() {
  const [data, setData] = useState<AuditEventsResponse>({ items: [], total: 0, page: 1, pageSize: 20 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mocked, setMocked] = useState(false);

  const fetchEvents = useCallback(async (query: AuditEventsQuery) => {
    setLoading(true);
    setError('');
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === '') return;
      params.set(key, String(value));
    });
    try {
      const response = await fetch(`${API_BASE_URL}/audit/events?${params}`, {
        headers: authenticatedHeaders(),
        credentials: 'include',
      });
      if (!response.ok) throw new Error(String(response.status));
      const payload = (await response.json()) as AuditEventsResponse;
      setData({
        items: payload.items || [],
        total: Number(payload.total || 0),
        page: Number(payload.page || query.page || 1),
        pageSize: Number(payload.pageSize || query.pageSize || 20),
      });
      setMocked(false);
    } catch {
      setData(mockAuditEvents(query));
      setMocked(true);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, mocked, fetchEvents };
}
