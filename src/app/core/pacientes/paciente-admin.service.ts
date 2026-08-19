import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Paciente, PacienteAdminUpdateRequest } from './paciente.model';

@Injectable({ providedIn: 'root' })
export class PacienteAdminService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/admin/pacientes`;

  listarTodos(): Observable<Paciente[]> {
    return this.http.get<Paciente[]>(this.baseUrl);
  }

  buscarPorId(id: number): Observable<Paciente> {
    return this.http.get<Paciente>(`${this.baseUrl}/${id}`);
  }

  atualizar(id: number, request: PacienteAdminUpdateRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, request);
  }
}
