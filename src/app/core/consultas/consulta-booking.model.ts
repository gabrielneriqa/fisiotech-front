import { TipoConsulta } from './consulta.model';

export interface ProfissionalBusca {
  id: number;
  nome: string;
  especialidade: string;
  valorConsultaParticular: number | null;
  conveniosAceitos: string[];
}

export interface SlotDisponibilidade {
  horario: string;
  disponivel: boolean;
}

export interface DisponibilidadeResponse {
  data: string;
  horarios: SlotDisponibilidade[];
}

export interface ConsultaBookingRequest {
  profissionalId: number;
  dataHora: string;
  tipo: TipoConsulta;
  convenio: string | null;
}
