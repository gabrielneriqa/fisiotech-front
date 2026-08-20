import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';

import { ConfirmDialogService } from '../../../core/ui/confirm-dialog/confirm-dialog.service';
import { ProfissionalForm } from './profissional-form';

describe('ProfissionalForm', () => {
  let fixture: ComponentFixture<ProfissionalForm>;
  let component: ProfissionalForm;
  let httpMock: HttpTestingController;
  let router: Router;
  let confirmDialog: ConfirmDialogService;

  async function criarComponente(idDaRota: string | null) {
    await TestBed.configureTestingModule({
      imports: [ProfissionalForm],
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

    fixture = TestBed.createComponent(ProfissionalForm);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    confirmDialog = TestBed.inject(ConfirmDialogService);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
  }

  afterEach(() => httpMock.verify());

  function preencherFormularioValido() {
    (component as any).form.patchValue({
      nome: 'Paula Nogueira',
      email: 'paula@fisiotech.com',
      senha: 'senha123',
      registroProfissional: 'CREFITO-33333',
      especialidade: 'Pediatria',
      valorConsultaParticular: 120,
    });
  }

  describe('criação (rota /novo)', () => {
    beforeEach(async () => {
      await criarComponente(null);
      fixture.detectChanges();
    });

    it('não deve chamar a API quando o formulário é inválido', () => {
      (component as any).submit();

      httpMock.expectNone('/profissionais');
    });

    it('deve marcar todos os campos como touched quando tenta salvar formulário inválido', () => {
      (component as any).submit();

      expect((component as any).form.get('nome')!.touched).toBe(true);
      expect((component as any).form.get('email')!.touched).toBe(true);
    });

    it('deve criar o profissional e navegar de volta para a lista quando o formulário é válido', () => {
      preencherFormularioValido();

      (component as any).submit();

      const req = httpMock.expectOne('/profissionais');
      expect(req.request.method).toBe('POST');
      expect(req.request.body.nome).toBe('Paula Nogueira');
      expect(req.request.body.conveniosAceitos).toEqual([]);
      req.flush(null);

      expect(router.navigateByUrl).toHaveBeenCalledWith('/admin/profissionais');
    });

    it('deve separar e limpar a lista de convênios aceitos digitada como texto', () => {
      preencherFormularioValido();
      (component as any).form.patchValue({ conveniosAceitos: 'Unimed,  Bradesco Saúde ,,' });

      (component as any).submit();

      const req = httpMock.expectOne('/profissionais');
      expect(req.request.body.conveniosAceitos).toEqual(['Unimed', 'Bradesco Saúde']);
      req.flush(null);
    });

    it('deve mostrar mensagem de duplicidade em um 409', () => {
      preencherFormularioValido();

      (component as any).submit();

      httpMock.expectOne('/profissionais').flush({}, { status: 409, statusText: 'Conflict' });

      expect((component as any).errorMessage()).toBe(
        'Já existe um profissional cadastrado com este email ou registro profissional.',
      );
      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });
  });

  describe('edição (rota /:id)', () => {
    beforeEach(async () => {
      await criarComponente('1');
    });

    function carregarProfissionalExistente() {
      fixture.detectChanges();
      httpMock.expectOne('/profissionais/1').flush({
        id: 1,
        nome: 'Ana Souza',
        email: 'ana@fisiotech.com',
        registroProfissional: 'CREFITO-11111',
        especialidade: 'Ortopedia',
        valorConsultaParticular: 150,
        conveniosAceitos: ['Unimed'],
        foto: null,
        dataNascimento: null,
        sexo: null,
        telefone: null,
        dataCriacao: '2026-08-20T09:00:00',
      });
    }

    it('deve carregar os dados existentes do profissional ao entrar na tela', () => {
      carregarProfissionalExistente();

      expect((component as any).form.get('nome')!.value).toBe('Ana Souza');
      expect((component as any).form.get('conveniosAceitos')!.value).toBe('Unimed');
      expect((component as any).editando()).toBe(true);
    });

    it('não deve exigir senha para salvar uma edição (regressão do F-01)', () => {
      carregarProfissionalExistente();

      (component as any).submit();

      expect((component as any).form.get('senha')!.valid).toBe(true);
      httpMock.expectOne('/profissionais/1');
    });

    it('deve enviar senha null quando o campo é deixado em branco na edição', () => {
      carregarProfissionalExistente();

      (component as any).submit();

      const req = httpMock.expectOne('/profissionais/1');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body.senha).toBeNull();
      req.flush(null);

      expect(router.navigateByUrl).toHaveBeenCalledWith('/admin/profissionais');
    });

    it('deve enviar a nova senha quando o campo é preenchido na edição', () => {
      carregarProfissionalExistente();

      (component as any).form.patchValue({ senha: 'novaSenha123' });
      (component as any).submit();

      const req = httpMock.expectOne('/profissionais/1');
      expect(req.request.body.senha).toBe('novaSenha123');
      req.flush(null);
    });

    it('não deve excluir quando o usuário cancela no diálogo de confirmação', async () => {
      carregarProfissionalExistente();

      const excluirPromise = (component as any).excluir();
      confirmDialog.responder(false);
      await excluirPromise;

      httpMock.expectNone('/profissionais/1');
    });

    it('deve excluir o profissional quando o usuário confirma no diálogo', async () => {
      carregarProfissionalExistente();

      const excluirPromise = (component as any).excluir();
      confirmDialog.responder(true);
      await excluirPromise;

      const req = httpMock.expectOne('/profissionais/1');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);

      expect(router.navigateByUrl).toHaveBeenCalledWith('/admin/profissionais');
    });
  });
});
