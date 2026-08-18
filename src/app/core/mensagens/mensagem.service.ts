import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { CaixaEntradaItem, Mensagem, MensagemCreateRequest } from './mensagem.model';

@Injectable({ providedIn: 'root' })
export class MensagemService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/mensagens`;

  listarPorPaciente(pacienteId: number): Observable<Mensagem[]> {
    return this.http.get<Mensagem[]>(this.baseUrl, { params: { pacienteId } });
  }

  enviar(request: MensagemCreateRequest): Observable<void> {
    return this.http.post<void>(this.baseUrl, request);
  }

  caixaEntrada(): Observable<CaixaEntradaItem[]> {
    return this.http.get<CaixaEntradaItem[]>(`${this.baseUrl}/caixa-entrada`);
  }
}
