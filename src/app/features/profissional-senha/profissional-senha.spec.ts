import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';
import { ProfissionalSenha } from './profissional-senha';

describe('ProfissionalSenha', () => {
  let fixture: ComponentFixture<ProfissionalSenha>;
  let component: ProfissionalSenha;
  let httpMock: HttpTestingController;
  let router: Router;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfissionalSenha],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfissionalSenha);
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

    httpMock.expectNone('/profissionais/me/senha');
  });

  it('deve mostrar erro quando a confirmação não bate com a nova senha', () => {
    preencherFormulario('senhaAtual123', 'novaSenha123', 'outraSenha123');
    (component as any).form.controls.confirmarNovaSenha.markAsDirty();

    expect((component as any).mensagemErroConfirmacao()).toBe('As senhas não coincidem.');
    (component as any).submit();
    httpMock.expectNone('/profissionais/me/senha');
  });

  it('deve mostrar "senha atual incorreta" em um 400', () => {
    preencherFormulario('senhaErrada', 'novaSenha123');

    (component as any).submit();

    httpMock.expectOne('/profissionais/me/senha').flush({}, { status: 400, statusText: 'Bad Request' });

    expect((component as any).errorMessage()).toBe('Senha atual incorreta.');
  });

  it('deve trocar a senha, refazer login com a nova senha e navegar para /home', () => {
    authService.login('ana@fisiotech.com', 'senhaAtual123').subscribe();
    httpMock
      .expectOne('/auth/me')
      .flush({ id: 1, nome: 'Ana Souza', email: 'ana@fisiotech.com', role: 'ROLE_PROFISSIONAL' });

    preencherFormulario('senhaAtual123', 'novaSenha123');

    (component as any).submit();

    httpMock.expectOne('/profissionais/me/senha').flush(null);

    const reloginReq = httpMock.expectOne('/auth/me');
    expect(reloginReq.request.headers.get('Authorization')).toBe(`Basic ${btoa('ana@fisiotech.com:novaSenha123')}`);
    reloginReq.flush({ id: 1, nome: 'Ana Souza', email: 'ana@fisiotech.com', role: 'ROLE_PROFISSIONAL' });

    expect((component as any).successMessage()).toBe('Senha alterada com sucesso.');
  });
});
