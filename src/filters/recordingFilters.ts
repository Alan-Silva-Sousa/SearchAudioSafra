export type RecordingFilterKind = 'text' | 'date';

export type RecordingFilterDefinition = {
  field: string;
  label: string;
  kind: RecordingFilterKind;
  participantKey?: string;
};

export const RECORDING_FILTERS: RecordingFilterDefinition[] = [
  { field: 'telefoneCliente', label: 'Telefone de Origem', kind: 'text' },
  { field: 'telefoneDestino', label: 'Telefone de Destino', kind: 'text' },
  { field: 'recordStartStart', label: 'Data/Hora Início Ligação', kind: 'date' },
  { field: 'recordStartEnd', label: 'Data/Hora Final Ligação', kind: 'date' },
  { field: 'cpf', label: 'CPF', kind: 'text', participantKey: 'CPF' },
  { field: 'cnpj', label: 'CNPJ', kind: 'text', participantKey: 'CNPJ' },
  { field: 'agencia', label: 'AGENCIA', kind: 'text', participantKey: 'AGENCIA' },
  { field: 'conta', label: 'CONTA', kind: 'text', participantKey: 'CONTA' },
  { field: 'ec', label: 'EC', kind: 'text', participantKey: 'EC' },
  { field: 'contrato', label: 'CONTRATO', kind: 'text', participantKey: 'CONTRATO' },
  { field: 'protocolo', label: 'PROTOCOLO', kind: 'text', participantKey: 'PROTOCOLO' },
  { field: 'filaSkill', label: 'Skill/Fila', kind: 'text' },
  { field: 'agentName', label: 'Nome do Agente', kind: 'text', participantKey: 'Nome do Agente' },
  { field: 'agentLogin', label: 'Login do Agente', kind: 'text', participantKey: 'Login do Agente' },
];

const filterByField = Object.fromEntries(RECORDING_FILTERS.map((item) => [item.field, item]));

export function recordingFilterLabel(field: string): string {
  return filterByField[field]?.label || 'Selecione';
}

export function isRecordingDateFilter(field: string): boolean {
  return filterByField[field]?.kind === 'date';
}
