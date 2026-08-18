export type AutorMensagem = 'PROFISSIONAL' | 'PACIENTE';

export interface Mensagem {
  id: number;
  pacienteId: number;
  autor: AutorMensagem;
  conteudo: string;
  dataEnvio: string;
}

export interface MensagemCreateRequest {
  pacienteId: number;
  autor: AutorMensagem;
  conteudo: string;
}
