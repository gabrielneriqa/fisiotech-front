import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Consulta, ConsultaCreateRequest, ConsultaUpdateRequest } from './consulta.model';

@Injectable({ providedIn: 'root' })
export class ConsultaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/consultas`;

  listarTodos(pacienteId?: number): Observable<Consulta[]> {
    let params = new HttpParams();
    if (pacienteId != null) {
      params = params.set('pacienteId', pacienteId);
    }
    return this.http.get<Consulta[]>(this.baseUrl, { params });
  }

  buscarPorId(id: number): Observable<Consulta> {
    return this.http.get<Consulta>(`${this.baseUrl}/${id}`);
  }

  criar(request: ConsultaCreateRequest): Observable<number> {
    return this.http
      .post(this.baseUrl, request, { observe: 'response' })
      .pipe(
        map((response) => {
          const location = response.headers.get('Location') ?? '';
          return Number(location.substring(location.lastIndexOf('/') + 1));
        }),
      );
  }

  atualizar(id: number, request: ConsultaUpdateRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, request);
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
