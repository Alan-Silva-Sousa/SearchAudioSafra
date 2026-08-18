import { useState } from 'react'
import type { FilterItem } from '../components/RecordingFilterBar';
import { authenticatedHeaders } from '../auth/accessContext';
import { RECORDING_FILTERS } from '../filters/recordingFilters';

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
  telefoneCliente: 'CustomerPhone',
  telefoneDestino: 'DestinationPhone',
  recordStartStart: 'RecordStartStart',
  recordStartEnd: 'RecordStartEnd',
  filaSkill: 'QueueSkill',
};

const participantFilterKeys = Object.fromEntries(
  RECORDING_FILTERS.filter((item) => item.participantKey).map((item) => [item.field, item.participantKey!]),
);

function resolveFilter(filter: FilterItem): { filterType: string; filterField: string; filterValue: string } | null {
  const value = filter.value?.trim();
  if (!filter.field || !value) return null;

  const participantKey = participantFilterKeys[filter.field];
  if (participantKey) {
    return { filterType: 'ParticipantData', filterField: participantKey, filterValue: value };
  }

  const filterType = FILTER_FIELD_TO_TYPE[filter.field];
  if (!filterType) return null;
  return { filterType, filterField: '', filterValue: value };
}

export default function useRecordings() {
  const [data, setData] = useState<RecordingMeta[]>([])
  const [dataUsers, setDataUsers] = useState<UserMeta[]>([])
  const [loading, setLoading] = useState(false)

  function buildQueryParams(filters: FilterItem[]): URLSearchParams {
    const params = new URLSearchParams();

    filters.forEach((filter) => {
      const resolved = resolveFilter(filter);
      if (!resolved) return;
      params.append('filterType', resolved.filterType);
      params.append('filterField', resolved.filterField);
      params.append('filterValue', resolved.filterValue);
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
