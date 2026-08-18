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

export interface CaixaEntradaItem {
  pacienteId: number;
  pacienteNome: string;
  ultimaMensagem: string;
  ultimoAutor: AutorMensagem;
  dataUltimaMensagem: string;
}
