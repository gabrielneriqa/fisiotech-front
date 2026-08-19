import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthService } from './auth.service';

/**
 * Anexa a credencial Basic Auth salva (se houver) em toda requisição HTTP.
 * Requisições que já vêm com seu próprio header Authorization (ex: AuthService.login,
 * que testa credenciais que ainda não estão - ou não estão mais - salvas) não são
 * sobrescritas, senão login com senha nova nunca conseguiria se autenticar com ela.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.headers.has('Authorization')) {
    return next(req);
  }

  const credentials = inject(AuthService).getStoredCredentials();

  if (!credentials) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: { Authorization: `Basic ${credentials}` },
    }),
  );
};
