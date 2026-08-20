import { TestBed } from '@angular/core/testing';
import { provideRouter, UrlTree } from '@angular/router';

import { AuthService } from './auth.service';
import { CurrentUser } from './current-user';
import { roleGuard } from './role.guard';

describe('roleGuard', () => {
  function configurar(user: CurrentUser | null) {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: { currentUser: () => user } }],
    });
  }

  function executarGuard(requiredRole: string) {
    return TestBed.runInInjectionContext(() => roleGuard(requiredRole)({} as never, {} as never));
  }

  it('deve permitir acesso quando o papel do usuário é o esperado', () => {
    configurar({ id: 1, nome: 'Ana', email: 'ana@fisiotech.com', role: 'ROLE_PROFISSIONAL' });

    expect(executarGuard('ROLE_PROFISSIONAL')).toBe(true);
  });

  it('deve redirecionar para /login quando não há usuário logado', () => {
    configurar(null);

    const resultado = executarGuard('ROLE_PROFISSIONAL') as UrlTree;

    expect(resultado.toString()).toBe('/login');
  });

  it('deve redirecionar admin para a área de admin quando tenta acessar área de paciente', () => {
    configurar({ id: 1, nome: 'Admin', email: 'admin@fisiotech.com', role: 'ROLE_ADMIN' });

    const resultado = executarGuard('ROLE_PACIENTE') as UrlTree;

    expect(resultado.toString()).toBe('/admin/profissionais');
  });

  it('deve redirecionar paciente para a home de paciente quando tenta acessar área de profissional', () => {
    configurar({ id: 1, nome: 'Joao', email: 'joao@paciente.com', role: 'ROLE_PACIENTE' });

    const resultado = executarGuard('ROLE_PROFISSIONAL') as UrlTree;

    expect(resultado.toString()).toBe('/paciente/home');
  });

  it('deve redirecionar profissional para /home quando tenta acessar área de admin', () => {
    configurar({ id: 1, nome: 'Ana', email: 'ana@fisiotech.com', role: 'ROLE_PROFISSIONAL' });

    const resultado = executarGuard('ROLE_ADMIN') as UrlTree;

    expect(resultado.toString()).toBe('/home');
  });
});
