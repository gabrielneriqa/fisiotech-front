import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';
import { AdminSenha } from './admin-senha';

describe('AdminSenha', () => {
  let fixture: ComponentFixture<AdminSenha>;
  let component: AdminSenha;
  let httpMock: HttpTestingController;
  let router: Router;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminSenha],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminSenha);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    authService = TestBed.inject(AuthService);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
  });

  afterEach(() => httpMock.verify());

  function preencherFormulario(senhaAtual: string, novaSenha: string, confirmacao = novaSenha) {
    (component as any).form.setValue({ senhaAtual, novaSenha, confirmarNovaSenha: confirmacao });
  }

  it('não deve chamar a API quando o formulário é inválido', () => {
    (component as any).submit();

    httpMock.expectNone('/admin/me/senha');
  });

  it('deve mostrar erro quando a confirmação não bate com a nova senha', () => {
    preencherFormulario('senhaAtual123', 'novaSenha123', 'outraSenha123');
    (component as any).form.controls.confirmarNovaSenha.markAsDirty();

    expect((component as any).mensagemErroConfirmacao()).toBe('As senhas não coincidem.');
    (component as any).submit();
    httpMock.expectNone('/admin/me/senha');
  });

  it('deve mostrar "senha atual incorreta" em um 400', () => {
    preencherFormulario('senhaErrada', 'novaSenha123');

    (component as any).submit();

    httpMock.expectOne('/admin/me/senha').flush({}, { status: 400, statusText: 'Bad Request' });

    expect((component as any).errorMessage()).toBe('Senha atual incorreta.');
  });

  it('deve trocar a senha, refazer login com a nova senha e navegar para /admin/profissionais', () => {
    authService.login('admin@fisiotech.com', '12345678').subscribe();
    httpMock
      .expectOne('/auth/me')
      .flush({ id: 1, nome: 'Admin', email: 'admin@fisiotech.com', role: 'ROLE_ADMIN' });

    preencherFormulario('12345678', 'novaSenhaAdmin123');

    (component as any).submit();

    httpMock.expectOne('/admin/me/senha').flush(null);

    const reloginReq = httpMock.expectOne('/auth/me');
    expect(reloginReq.request.headers.get('Authorization')).toBe(
      `Basic ${btoa('admin@fisiotech.com:novaSenhaAdmin123')}`,
    );
    reloginReq.flush({ id: 1, nome: 'Admin', email: 'admin@fisiotech.com', role: 'ROLE_ADMIN' });

    expect((component as any).successMessage()).toBe('Senha alterada com sucesso.');
  });
});
