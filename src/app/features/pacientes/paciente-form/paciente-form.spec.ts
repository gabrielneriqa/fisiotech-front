import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';

import { PacienteForm } from './paciente-form';

describe('PacienteForm', () => {
  let fixture: ComponentFixture<PacienteForm>;
  let component: PacienteForm;
  let httpMock: HttpTestingController;
  let router: Router;

  async function criarComponente(idDaRota: string | null) {
    await TestBed.configureTestingModule({
      imports: [PacienteForm],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: (_key: string) => idDaRota } } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PacienteForm);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
  }

  afterEach(() => httpMock.verify());

  describe('criação (rota /pacientes/novo)', () => {
    beforeEach(async () => {
      await criarComponente(null);
      fixture.detectChanges();
    });

    it('exige senha para cadastrar um paciente novo', () => {
      (component as any).submit();

      httpMock.expectNone('/pacientes');
      expect((component as any).form.get('senha')!.invalid).toBe(true);
    });

    it('cadastra o paciente quando o formulário é válido', () => {
      (component as any).form.patchValue({
        nome: 'Joao Silva',
        email: 'joao@paciente.com',
        senha: 'senha123',
      });

      (component as any).submit();

      const req = httpMock.expectOne('/pacientes');
      expect(req.request.method).toBe('POST');
      req.flush(null);

      expect(router.navigateByUrl).toHaveBeenCalledWith('/pacientes');
    });
  });

  describe('edição (rota /pacientes/:id)', () => {
    beforeEach(async () => {
      await criarComponente('1');
    });

    function carregarPacienteExistente() {
      fixture.detectChanges();
      httpMock.expectOne('/pacientes/1').flush({
        id: 1,
        nome: 'Joao Silva',
        email: 'joao@paciente.com',
        profissionalId: 1,
        profissionalNome: 'Ana Souza',
        dataNascimento: null,
        sexo: null,
        profissao: null,
        telefone: null,
        endereco: null,
        bairro: null,
        foto: null,
        dataCriacao: '2026-08-20T09:00:00',
      });
      httpMock.expectOne('/consultas?pacienteId=1').flush([]);
    }

    it('não exige senha para salvar uma edição (regressão do F-01)', () => {
      carregarPacienteExistente();

      (component as any).submit();

      expect((component as any).form.get('senha')!.valid).toBe(true);
      httpMock.expectOne('/pacientes/1');
    });

    it('envia senha null quando o campo é deixado em branco na edição', () => {
      carregarPacienteExistente();

      (component as any).submit();

      const req = httpMock.expectOne('/pacientes/1');
      expect(req.request.body.senha).toBeNull();
      req.flush(null);
    });

    it('envia a nova senha quando o campo é preenchido na edição', () => {
      carregarPacienteExistente();

      (component as any).form.patchValue({ senha: 'novaSenha123' });
      (component as any).submit();

      const req = httpMock.expectOne('/pacientes/1');
      expect(req.request.body.senha).toBe('novaSenha123');
      req.flush(null);
    });
  });
});
