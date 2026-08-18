export interface Paciente {
  id: number;
  nome: string;
  email: string;
  profissionalId: number;
  dataCriacao: string;
}

export interface PacienteCreateRequest {
  nome: string;
  email: string;
  senha: string;
}

export interface PacienteUpdateRequest {
  nome: string;
  email: string;
  senha: string;
}
