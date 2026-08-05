import { useState } from 'react'
import type { FilterItem } from '../components/RecordingFilterBar';
import { authenticatedHeaders } from '../auth/accessContext';

export interface RecordingMeta {
  CallIDMaster: string
  IdOrigem: string
  ANI: string
  DNIS: string
  RecordStart: string
  RecordDuration: number
  DestinationFileName: string
  CampaignId: string
  AgentId: string
  DestinationFileSize: number
  Disposition: string
  S3Directory: string
  S3FileName: string
  Username: string
  AgentLogin: string
  Campaignname: string
  Dispositionname: string
  Direction: string
  MediaType: string
  ContentType: string
  FileExtension: string
  CPF: string
  CNPJ: string
  AGENCIA: string
  CONTA: string
  EC: string
  CONTRATO: string
  PROTOCOLO: string
  ParticipantData: Record<string, unknown>
}

export interface UserMeta {
  id: string
  email: string
  createdAt: string
  lastLogin: string
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/audio/api';

const FILTER_FIELD_TO_TYPE: Record<string, string> = {
  date: 'RecordStart',
  telefoneCliente: 'CustomerPhone',
  telefoneDestino: 'DestinationPhone',
  documento: 'Document',
  filaSkill: 'QueueSkill',
  ambiente: 'Environment',
  duracao: 'Duration',
  format: 'Format',
};

function normalizeDuration(value: string): string {
  const parts = value.trim().split(':').map(Number);
  if (parts.some(Number.isNaN)) return value.trim();
  if (parts.length === 2) return String(parts[0] * 60 + parts[1]);
  if (parts.length === 3) return String(parts[0] * 3600 + parts[1] * 60 + parts[2]);
  return value.trim();
}

export default function useRecordings() {
  const [data, setData] = useState<RecordingMeta[]>([])
  const [dataUsers, setDataUsers] = useState<UserMeta[]>([])
  const [loading, setLoading] = useState(false)

  function buildQueryParams(filters: FilterItem[]): URLSearchParams {
    const params = new URLSearchParams();

    filters.forEach(filter => {
      if (!filter.field) return;

      const filterType = FILTER_FIELD_TO_TYPE[filter.field];
      if (!filterType) return;

      const value = filter.field === 'date' ? filter.start : filter.value;
      if (!value) return;

      params.append('filterType', filterType);
      params.append(
        'filterValue',
        filter.field === 'duracao' ? normalizeDuration(value) : value,
      );
    });

    return params;
  }

  async function fetchRecordings(filters: FilterItem[]) {
    setLoading(true);

    try {
      const params = buildQueryParams(filters);
      const url = `${API_BASE_URL}/audio${params.toString() ? `?${params.toString()}` : ''}`;

      const response = await fetch(url, {
        headers: authenticatedHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar gravações: ${response.status}`);
      }

      const result: RecordingMeta[] = await response.json();
      setData(result);
    } catch (error) {
      console.error(error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }

  return { dataUsers, data, fetchRecordings, loading }
}
