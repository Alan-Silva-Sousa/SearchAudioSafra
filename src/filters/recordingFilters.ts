export type RecordingFilterKind = 'text' | 'daterange';

export type RecordingFilterDefinition = {
  field: string;
  label: string;
  kind: RecordingFilterKind;
  participantKey?: string;
};

export const RECORDING_FILTERS: RecordingFilterDefinition[] = [
  { field: 'telefoneCliente', label: 'Telefone de Origem', kind: 'text' },
  { field: 'telefoneDestino', label: 'Telefone de Destino', kind: 'text' },
  { field: 'recordStart', label: 'Data e Hora', kind: 'daterange' },
  { field: 'documento', label: 'CPF/CNPJ', kind: 'text' },
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

export function isRecordingDateRangeFilter(field: string): boolean {
  return filterByField[field]?.kind === 'daterange';
}
