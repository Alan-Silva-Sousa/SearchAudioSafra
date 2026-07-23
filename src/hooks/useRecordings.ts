import { useState } from 'react'
import type { FilterItem } from '../components/RecordingFilterBar';
import { useNavigate } from 'react-router-dom';

const mockRecordings: RecordingMeta[] = Array.from({ length: 50 }, (_, i) => ({
  CallIDMaster: `CALL-${i}`,
  ANI: "11" + String(99999990 + i).padStart(8, '0'),
  DNIS: "11" + String(33330000 + i).padStart(8, '0'),
  RecordStart: new Date(
    2026,
    4,
    (i % 28) + 1,
    8 + (i % 10),
    (i * 7) % 60
  ).toISOString(),
  RecordDuration: 185,
  DestinationFileName: `gravacao${i}.wav`,
  CampaignId: "1",
  AgentId: "10",
  DestinationFileSize: 5242880,
  Disposition: "Venda",
  S3Directory: "mock",
  S3FileName: `gravacao${i}.wav`,
  Username: [
    "João",
    "Maria",
    "Carlos",
    "Fernanda",
    "Lucas"
  ][i % 5],
  AgentLogin: [
    "joao.silva",
    "maria.santos",
    "carlos.oliveira",
    "fernanda.costa",
    "lucas.pereira"
  ][i % 5],
  Campaignname: [
    "Treinamento",
    "Marketing",
    "Suporte",
    "Onboarding",
    "Produto"
  ][i % 5],
  Dispositionname: [
    "Processado",
    "Pendente",
    "Erro",
    "Publicado"
  ][i % 4],
  Direction: i % 2 === 0 ? "outbound" : "inbound",
  MediaType: "audio",
  ContentType: "audio/wav",
  CPF: String(11111111000 + i).padStart(11, '0'),
  CNPJ: String(11222333000100 + i).padStart(14, '0'),
  AGENCIA: String(1000 + (i % 100)).padStart(5, '0'),
  CONTA: String(100000 + (i % 100000)).padStart(8, '0'),
  EC: String(1000000 + (i % 1000000)).padStart(6, '0'),
  CONTRATO: `CONT-${String(10000 + i).padStart(6, '0')}`,
  PROTOCOLO: `PROT-${String(50000 + i).padStart(6, '0')}`
}));

export interface RecordingMeta {
  CallIDMaster: string
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

export default function useRecordings() {
  const navigate = useNavigate();

  const [data, setData] = useState<RecordingMeta[]>([])
  const [dataUsers, setDataUsers] = useState<UserMeta[]>([])
  const [loading, setLoading] = useState(false)

  const toParam = (v: string | Date | null | undefined) =>
    v && typeof v === 'object' && v instanceof Date
      ? v.toISOString().slice(0, 10)
      : String(v ?? '');

  async function fetchRecordings(filters: FilterItem[]) {
    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      let filtered = [...mockRecordings];
      filters.forEach(filter => {
        if (!filter.field) return;

        if (filter.field === "user" && filter.value) {
          filtered = filtered.filter(item =>
            item.Username.toLowerCase().includes(filter.value.toLowerCase())
          );
        }

        if (filter.field === "agentLogin" && filter.value) {
          filtered = filtered.filter(item =>
            item.AgentLogin.toLowerCase().includes(filter.value.toLowerCase())
          );
        }

        if (filter.field === "category" && filter.value) {
          filtered = filtered.filter(item =>
            item.Campaignname.toLowerCase().includes(filter.value.toLowerCase())
          );
        }

        if (filter.field === "format" && filter.value) {
          filtered = filtered.filter(item =>
            item.ContentType.toLowerCase().includes(filter.value.toLowerCase())
          );
        }

        if (filter.field === "ani" && filter.value) {
          filtered = filtered.filter(item =>
            item.ANI.includes(filter.value)
          );
        }

        if (filter.field === "dnis" && filter.value) {
          filtered = filtered.filter(item =>
            item.DNIS.includes(filter.value)
          );
        }

        if (filter.field === "cpf" && filter.value) {
          filtered = filtered.filter(item =>
            item.CPF.includes(filter.value)
          );
        }

        if (filter.field === "cnpj" && filter.value) {
          filtered = filtered.filter(item =>
            item.CNPJ.includes(filter.value)
          );
        }

        if (filter.field === "agencia" && filter.value) {
          filtered = filtered.filter(item =>
            item.AGENCIA.includes(filter.value)
          );
        }

        if (filter.field === "conta" && filter.value) {
          filtered = filtered.filter(item =>
            item.CONTA.includes(filter.value)
          );
        }

        if (filter.field === "ec" && filter.value) {
          filtered = filtered.filter(item =>
            item.EC.includes(filter.value)
          );
        }

        if (filter.field === "contrato" && filter.value) {
          filtered = filtered.filter(item =>
            item.CONTRATO.toLowerCase().includes(filter.value.toLowerCase())
          );
        }

        if (filter.field === "protocolo" && filter.value) {
          filtered = filtered.filter(item =>
            item.PROTOCOLO.toLowerCase().includes(filter.value.toLowerCase())
          );
        }

        if (filter.field === "date" && filter.value) {
          filtered = filtered.filter(item => {
            const itemDate = new Date(item.RecordStart)
              .toISOString()
              .slice(0, 10);

            return itemDate === filter.value;
          });
        }
      });

      setData(filtered);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return { dataUsers, data, fetchRecordings, loading }
}

/*const mockRecordings: RecordingMeta[] = [
  {
    CallIDMaster: "CALL-001",
    ANI: "11999999999",
    DNIS: "1133334444",
    RecordStart: "2026-05-19T10:30:00",
    RecordDuration: 185,
    DestinationFileName: "gravacao1.wav",
    CampaignId: "1",
    AgentId: "10",
    DestinationFileSize: 5242880,
    Disposition: "Venda",
    S3Directory: "mock",
    S3FileName: "gravacao1.wav",
    Username: "João Silva",
    Campaignname: "Campanha Black Friday",
    Dispositionname: "Venda Efetivada",
    Direction: "outbound",
    MediaType: "audio",
    ContentType: "audio/wav"
  },

  {
    CallIDMaster: "CALL-002",
    ANI: "11988888888",
    DNIS: "1144445555",
    RecordStart: "2026-05-18T14:15:00",
    RecordDuration: 92,
    DestinationFileName: "gravacao2.wav",
    CampaignId: "2",
    AgentId: "11",
    DestinationFileSize: 3145728,
    Disposition: "Suporte",
    S3Directory: "mock",
    S3FileName: "gravacao2.wav",
    Username: "Maria Souza",
    Campaignname: "Suporte Premium",
    Dispositionname: "Resolvido",
    Direction: "inbound",
    MediaType: "audio",
    ContentType: "audio/wav"
  },

  {
    CallIDMaster: "CALL-003",
    ANI: "11977777777",
    DNIS: "1155556666",
    RecordStart: "2026-05-17T09:00:00",
    RecordDuration: 420,
    DestinationFileName: "gravacao3.wav",
    CampaignId: "3",
    AgentId: "12",
    DestinationFileSize: 10485760,
    Disposition: "Cobrança",
    S3Directory: "mock",
    S3FileName: "gravacao3.wav",
    Username: "Carlos Lima",
    Campaignname: "Cobrança Maio",
    Dispositionname: "Acordo Fechado",
    Direction: "outbound",
    MediaType: "audio",
    ContentType: "audio/wav"
  }
];*/