import { useState } from 'react'
import type { FilterItem } from '../components/RecordingFilterBar';

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
}

export interface UserMeta {
  id: string
  email: string
  createdAt: string
  lastLogin: string
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const FILTER_FIELD_TO_TYPE: Record<string, string> = {
  date: 'RecordStart',
  ani: 'ANI',
  dnis: 'ANI',
  user: 'Agent',
  agentLogin: 'Agent',
  category: 'Campaign',
};

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

      if (!filter.value) return;

      params.append('filterType', filterType);
      params.append('filterValue', filter.value);
    });

    return params;
  }

  async function fetchRecordings(filters: FilterItem[]) {
    setLoading(true);

    try {
      const params = buildQueryParams(filters);
      const url = `${API_BASE_URL}/audio${params.toString() ? `?${params.toString()}` : ''}`;

      const response = await fetch(url);

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