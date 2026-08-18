import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthService } from './auth.service';

/** Anexa a credencial Basic Auth salva (se houver) em toda requisição HTTP. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
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
