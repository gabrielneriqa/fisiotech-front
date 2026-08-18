import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Avaliacao, AvaliacaoCreateRequest } from '../avaliacoes/avaliacao.model';
import { Consulta } from '../consultas/consulta.model';
import { Mensagem } from '../mensagens/mensagem.model';
import { Paciente, PacienteUpdateRequest } from '../pacientes/paciente.model';

@Injectable({ providedIn: 'root' })
export class MeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/me`;

  perfil(): Observable<Paciente> {
    return this.http.get<Paciente>(this.baseUrl);
  }

  atualizarPerfil(request: PacienteUpdateRequest): Observable<void> {
    return this.http.put<void>(this.baseUrl, request);
  }

  minhasConsultas(): Observable<Consulta[]> {
    return this.http.get<Consulta[]>(`${this.baseUrl}/consultas`);
  }

  minhaConsulta(id: number): Observable<Consulta> {
    return this.http.get<Consulta>(`${this.baseUrl}/consultas/${id}`);
  }

  minhasMensagens(): Observable<Mensagem[]> {
    return this.http.get<Mensagem[]>(`${this.baseUrl}/mensagens`);
  }

  enviarMensagem(conteudo: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/mensagens`, { conteudo });
  }

  avaliar(request: AvaliacaoCreateRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/avaliacoes`, request);
  }

  minhaAvaliacao(consultaId: number): Observable<Avaliacao> {
    return this.http.get<Avaliacao>(`${this.baseUrl}/avaliacoes/consulta/${consultaId}`);
  }
}
