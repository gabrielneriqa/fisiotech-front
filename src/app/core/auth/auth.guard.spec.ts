import { TestBed } from '@angular/core/testing';
import { provideRouter, UrlTree } from '@angular/router';
import { firstValueFrom, isObservable, Observable, of, throwError } from 'rxjs';

import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { CurrentUser } from './current-user';

describe('authGuard', () => {
  const usuario: CurrentUser = { id: 1, nome: 'Ana Souza', email: 'ana@fisiotech.com', role: 'ROLE_PROFISSIONAL' };

  function configurar(authServiceMock: Record<string, unknown>) {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: authServiceMock }],
    });
  }

  function executarGuard() {
    return TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));
  }

  it('deve permitir acesso quando já há um usuário autenticado', () => {
    configurar({ isAuthenticated: () => true });

    expect(executarGuard()).toBe(true);
  });

  it('deve redirecionar para /login quando não há sessão para restaurar', () => {
    configurar({ isAuthenticated: () => false, restoreSession: () => null });

    const resultado = executarGuard() as UrlTree;

    expect(resultado.toString()).toBe('/login');
  });

  it('deve permitir acesso quando a sessão salva é restaurada com sucesso', async () => {
    configurar({ isAuthenticated: () => false, restoreSession: () => of(usuario) });

    const resultado = executarGuard();
    expect(isObservable(resultado)).toBe(true);

    const valor = await firstValueFrom(resultado as Observable<boolean>);
    expect(valor).toBe(true);
  });

  it('deve redirecionar para /login quando restaurar a sessão salva falha', async () => {
    configurar({ isAuthenticated: () => false, restoreSession: () => throwError(() => new Error('401')) });

    const resultado = executarGuard();
    expect(isObservable(resultado)).toBe(true);

    const valor = await firstValueFrom(resultado as Observable<UrlTree>);
    expect(valor.toString()).toBe('/login');
  });
});
