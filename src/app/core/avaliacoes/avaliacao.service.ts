import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Avaliacao, AvaliacaoCreateRequest } from './avaliacao.model';

@Injectable({ providedIn: 'root' })
export class AvaliacaoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/avaliacoes`;

  buscarPorConsulta(consultaId: number): Observable<Avaliacao> {
    return this.http.get<Avaliacao>(`${this.baseUrl}/consulta/${consultaId}`);
  }

  criar(request: AvaliacaoCreateRequest): Observable<void> {
    return this.http.post<void>(this.baseUrl, request);
  }
}
