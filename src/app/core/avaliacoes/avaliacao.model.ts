export interface Avaliacao {
  id: number;
  consultaId: number;
  nota: number;
  comentario: string | null;
  dataCriacao: string;
}

export interface AvaliacaoCreateRequest {
  consultaId: number;
  nota: number;
  comentario: string | null;
}
