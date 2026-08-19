import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Paciente, PacienteCreateRequest, PacienteUpdateRequest } from './paciente.model';

@Injectable({ providedIn: 'root' })
export class PacienteService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/pacientes`;

  listarTodos(): Observable<Paciente[]> {
    return this.http.get<Paciente[]>(this.baseUrl);
  }

  buscarPorId(id: number): Observable<Paciente> {
    return this.http.get<Paciente>(`${this.baseUrl}/${id}`);
  }

  criar(request: PacienteCreateRequest): Observable<void> {
    return this.http.post<void>(this.baseUrl, request);
  }

  cadastrarPublico(request: PacienteCreateRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/cadastro`, request);
  }

  atualizar(id: number, request: PacienteUpdateRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, request);
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
