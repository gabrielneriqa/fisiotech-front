import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';
import { CurrentUser } from './current-user';

const STORAGE_KEY = 'fisiotech.auth.credentials';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const usuario: CurrentUser = { id: 1, nome: 'Ana Souza', email: 'ana@fisiotech.com', role: 'ROLE_PROFISSIONAL' };

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  it('deve autenticar, salvar as credenciais e atualizar o usuário atual', () => {
    let resultado: CurrentUser | undefined;
    service.login('ana@fisiotech.com', 'senha123').subscribe((u) => (resultado = u));

    const req = httpMock.expectOne('/auth/me');
    expect(req.request.headers.get('Authorization')).toBe(`Basic ${btoa('ana@fisiotech.com:senha123')}`);
    req.flush(usuario);

    expect(resultado).toEqual(usuario);
    expect(service.currentUser()).toEqual(usuario);
    expect(service.isAuthenticated()).toBe(true);
    expect(sessionStorage.getItem(STORAGE_KEY)).toBe(btoa('ana@fisiotech.com:senha123'));
  });

  it('não deve autenticar nem salvar nada quando as credenciais são inválidas', () => {
    let erro: unknown;
    service.login('ana@fisiotech.com', 'errada').subscribe({ error: (e) => (erro = e) });

    const req = httpMock.expectOne('/auth/me');
    req.flush({ message: 'unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    expect(erro).toBeTruthy();
    expect(service.isAuthenticated()).toBe(false);
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('logout deve limpar a sessão salva e o usuário atual', () => {
    service.login('ana@fisiotech.com', 'senha123').subscribe();
    httpMock.expectOne('/auth/me').flush(usuario);
    expect(service.isAuthenticated()).toBe(true);

    service.logout();

    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('restoreSession deve retornar null quando não há credenciais salvas', () => {
    expect(service.restoreSession()).toBeNull();
  });

  it('restoreSession deve restaurar o usuário quando há credenciais salvas válidas', () => {
    sessionStorage.setItem(STORAGE_KEY, btoa('ana@fisiotech.com:senha123'));

    let resultado: CurrentUser | undefined;
    service.restoreSession()!.subscribe((u) => (resultado = u));

    const req = httpMock.expectOne('/auth/me');
    req.flush(usuario);

    expect(resultado).toEqual(usuario);
    expect(service.currentUser()).toEqual(usuario);
  });

  it('getStoredCredentials deve refletir o valor salvo no sessionStorage', () => {
    expect(service.getStoredCredentials()).toBeNull();
    sessionStorage.setItem(STORAGE_KEY, 'abc123');
    expect(service.getStoredCredentials()).toBe('abc123');
  });
});
