import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { authInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  function configurar(storedCredentials: string | null) {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: { getStoredCredentials: () => storedCredentials } },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  }

  afterEach(() => httpMock.verify());

  it('deve anexar o header Authorization quando há credenciais salvas', () => {
    configurar('YWJj');

    http.get('/pacientes').subscribe();

    const req = httpMock.expectOne('/pacientes');
    expect(req.request.headers.get('Authorization')).toBe('Basic YWJj');
    req.flush({});
  });

  it('não deve anexar header quando não há credenciais salvas', () => {
    configurar(null);

    http.get('/pacientes').subscribe();

    const req = httpMock.expectOne('/pacientes');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('não deve sobrescrever um header Authorization já definido pela própria chamada (ex: login)', () => {
    configurar('YWJj');

    http.get('/auth/me', { headers: { Authorization: 'Basic ZGlmZXJlbnRl' } }).subscribe();

    const req = httpMock.expectOne('/auth/me');
    expect(req.request.headers.get('Authorization')).toBe('Basic ZGlmZXJlbnRl');
    req.flush({});
  });
});
