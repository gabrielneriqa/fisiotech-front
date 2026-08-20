import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AlterarSenhaRequest } from '../auth/current-user';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/admin/me`;

  alterarPropriaSenha(request: AlterarSenhaRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/senha`, request);
  }
}
