import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Profissional, ProfissionalCreateRequest, ProfissionalUpdateRequest } from './profissional.model';

@Injectable({ providedIn: 'root' })
export class ProfissionalService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/profissionais`;

  listarTodos(): Observable<Profissional[]> {
    return this.http.get<Profissional[]>(this.baseUrl);
  }

  buscarPorId(id: number): Observable<Profissional> {
    return this.http.get<Profissional>(`${this.baseUrl}/${id}`);
  }

  criar(request: ProfissionalCreateRequest): Observable<void> {
    return this.http.post<void>(this.baseUrl, request);
  }

  atualizar(id: number, request: ProfissionalUpdateRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, request);
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
