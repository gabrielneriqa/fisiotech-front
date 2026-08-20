import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { Login } from './login';

describe('Login', () => {
  let fixture: ComponentFixture<Login>;
  let component: Login;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
  });

  afterEach(() => httpMock.verify());

  it('deve iniciar na aba de login com o papel "médico" selecionado', () => {
    expect((component as any).aba()).toBe('login');
    expect((component as any).papelSelecionado()).toBe('ROLE_PROFISSIONAL');
  });

  it('selecionarAba deve trocar a aba e limpar mensagens de erro', () => {
    (component as any).errorMessage.set('erro antigo');
    (component as any).cadastroErrorMessage.set('outro erro');

    (component as any).selecionarAba('cadastro');

    expect((component as any).aba()).toBe('cadastro');
    expect((component as any).errorMessage()).toBeNull();
    expect((component as any).cadastroErrorMessage()).toBeNull();
  });

  it('não deve chamar a API quando o formulário de login é inválido', () => {
    (component as any).submit();

    httpMock.expectNone('/auth/me');
    expect((component as any).form.get('email')!.touched).toBe(true);
  });

  it('deve logar e navegar para a home do papel quando as credenciais são válidas e o papel bate', () => {
    (component as any).form.setValue({ email: 'ana@fisiotech.com', senha: 'senha123' });

    (component as any).submit();

    httpMock
      .expectOne('/auth/me')
      .flush({ id: 1, nome: 'Ana Souza', email: 'ana@fisiotech.com', role: 'ROLE_PROFISSIONAL' });

    expect(router.navigateByUrl).toHaveBeenCalledWith('/home');
    expect((component as any).errorMessage()).toBeNull();
  });

  it('deve deslogar e mostrar erro quando o papel das credenciais não bate com o selecionado', () => {
    (component as any).selecionarPapel('ROLE_PACIENTE');
    (component as any).form.setValue({ email: 'ana@fisiotech.com', senha: 'senha123' });

    (component as any).submit();

    httpMock
      .expectOne('/auth/me')
      .flush({ id: 1, nome: 'Ana Souza', email: 'ana@fisiotech.com', role: 'ROLE_PROFISSIONAL' });

    expect(router.navigateByUrl).not.toHaveBeenCalled();
    expect((component as any).errorMessage()).toBe('Essas credenciais não são de um paciente.');
  });

  it('admin deve conseguir logar independente do papel selecionado na tela', () => {
    (component as any).selecionarPapel('ROLE_PACIENTE');
    (component as any).form.setValue({ email: 'admin@fisiotech.com', senha: '12345678' });

    (component as any).submit();

    httpMock
      .expectOne('/auth/me')
      .flush({ id: 1, nome: 'Admin', email: 'admin@fisiotech.com', role: 'ROLE_ADMIN' });

    expect(router.navigateByUrl).toHaveBeenCalledWith('/admin/profissionais');
  });

  it('deve mostrar mensagem de credenciais incorretas em um 401', () => {
    (component as any).form.setValue({ email: 'ana@fisiotech.com', senha: 'errada' });

    (component as any).submit();

    httpMock.expectOne('/auth/me').flush({}, { status: 401, statusText: 'Unauthorized' });

    expect((component as any).errorMessage()).toBe('Usuário ou senha incorreta.');
  });

  it('não deve chamar a API de cadastro quando o formulário de cadastro é inválido', () => {
    (component as any).submitCadastro();

    httpMock.expectNone('/pacientes/cadastro');
  });

  it('deve cadastrar, logar automaticamente e navegar para a home do paciente', () => {
    (component as any).formCadastro.setValue({ nome: 'Joao Silva', email: 'joao@paciente.com', senha: 'senha123' });

    (component as any).submitCadastro();

    httpMock.expectOne('/pacientes/cadastro').flush(null);
    httpMock
      .expectOne('/auth/me')
      .flush({ id: 1, nome: 'Joao Silva', email: 'joao@paciente.com', role: 'ROLE_PACIENTE' });

    expect(router.navigateByUrl).toHaveBeenCalledWith('/paciente/home');
  });

  it('deve avisar de email duplicado em um 409 no cadastro', () => {
    (component as any).formCadastro.setValue({ nome: 'Joao Silva', email: 'joao@paciente.com', senha: 'senha123' });

    (component as any).submitCadastro();

    httpMock.expectOne('/pacientes/cadastro').flush({}, { status: 409, statusText: 'Conflict' });

    expect((component as any).cadastroErrorMessage()).toBe('Já existe uma conta com este email.');
  });
});
