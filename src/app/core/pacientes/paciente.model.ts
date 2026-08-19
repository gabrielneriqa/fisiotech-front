export interface Paciente {
  id: number;
  nome: string;
  email: string;
  profissionalId: number | null;
  profissionalNome: string | null;
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

export interface PacienteAdminUpdateRequest {
  nome: string;
  email: string;
  senha: string | null;
  profissionalId: number;
}
