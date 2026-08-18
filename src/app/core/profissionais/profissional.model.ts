export interface Profissional {
  id: number;
  nome: string;
  email: string;
  registroProfissional: string;
  especialidade: string;
  dataCriacao: string;
}

export interface ProfissionalCreateRequest {
  nome: string;
  email: string;
  senha: string;
  registroProfissional: string;
  especialidade: string;
}

export interface ProfissionalUpdateRequest {
  nome: string;
  email: string;
  senha: string;
  registroProfissional: string;
  especialidade: string;
}
