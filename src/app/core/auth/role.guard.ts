import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';
import { homeRouteFor } from './role-routes';

/** Redireciona pra Home correta caso o usuário logado não tenha o papel esperado nesta área. */
export function roleGuard(requiredRole: string): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const user = authService.currentUser();
    if (!user) {
      return router.createUrlTree(['/login']);
    }

    if (user.role !== requiredRole) {
      return router.createUrlTree([homeRouteFor(user.role)]);
    }

    return true;
  };
}
