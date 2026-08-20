import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Avaliacao, AvaliacaoCreateRequest } from '../avaliacoes/avaliacao.model';
import { Consulta } from '../consultas/consulta.model';
import { Mensagem, MinhaConversaItem } from '../mensagens/mensagem.model';
import { AlterarSenhaRequest } from '../auth/current-user';
import { MePerfilUpdateRequest, Paciente } from '../pacientes/paciente.model';
import { ConsultaBookingRequest, DisponibilidadeResponse, ProfissionalBusca } from '../consultas/consulta-booking.model';

@Injectable({ providedIn: 'root' })
export class MeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/me`;

  perfil(): Observable<Paciente> {
    return this.http.get<Paciente>(this.baseUrl);
  }

  atualizarPerfil(request: MePerfilUpdateRequest): Observable<void> {
    return this.http.put<void>(this.baseUrl, request);
  }

  alterarSenha(request: AlterarSenhaRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/senha`, request);
  }

  minhasConsultas(): Observable<Consulta[]> {
    return this.http.get<Consulta[]>(`${this.baseUrl}/consultas`);
  }

  minhaConsulta(id: number): Observable<Consulta> {
    return this.http.get<Consulta>(`${this.baseUrl}/consultas/${id}`);
  }

  cancelarConsulta(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/consultas/${id}/cancelar`, {});
  }

  remarcarConsulta(id: number, novaDataHora: string): Observable<Consulta> {
    return this.http.put<Consulta>(`${this.baseUrl}/consultas/${id}/remarcar`, { novaDataHora });
  }

  minhasConversas(): Observable<MinhaConversaItem[]> {
    return this.http.get<MinhaConversaItem[]>(`${this.baseUrl}/mensagens/caixa-entrada`);
  }

  minhaConversa(profissionalId: number): Observable<Mensagem[]> {
    return this.http.get<Mensagem[]>(`${this.baseUrl}/mensagens/${profissionalId}`);
  }

  enviarMensagem(profissionalId: number, conteudo: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/mensagens/${profissionalId}`, { conteudo });
  }

  avaliar(request: AvaliacaoCreateRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/avaliacoes`, request);
  }

  minhaAvaliacao(consultaId: number): Observable<Avaliacao> {
    return this.http.get<Avaliacao>(`${this.baseUrl}/avaliacoes/consulta/${consultaId}`);
  }

  buscarProfissionais(nome?: string, especialidade?: string): Observable<ProfissionalBusca[]> {
    const params: Record<string, string> = {};
    if (nome) {
      params['nome'] = nome;
    }
    if (especialidade) {
      params['especialidade'] = especialidade;
    }
    return this.http.get<ProfissionalBusca[]>(`${this.baseUrl}/profissionais`, { params });
  }

  buscarProfissional(profissionalId: number): Observable<ProfissionalBusca> {
    return this.http.get<ProfissionalBusca>(`${this.baseUrl}/profissionais/${profissionalId}`);
  }

  buscarDisponibilidade(profissionalId: number, data: string): Observable<DisponibilidadeResponse> {
    return this.http.get<DisponibilidadeResponse>(`${this.baseUrl}/profissionais/${profissionalId}/disponibilidade`, {
      params: { data },
    });
  }

  marcarConsulta(request: ConsultaBookingRequest): Observable<Consulta> {
    return this.http.post<Consulta>(`${this.baseUrl}/consultas`, request);
  }
}
