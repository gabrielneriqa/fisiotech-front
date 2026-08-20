import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ConfirmDialogService } from '../../../core/ui/confirm-dialog/confirm-dialog.service';
import { PacienteList } from './paciente-list';

describe('PacienteList', () => {
  let fixture: ComponentFixture<PacienteList>;
  let component: PacienteList;
  let httpMock: HttpTestingController;
  let confirmDialog: ConfirmDialogService;

  const paciente = {
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
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PacienteList],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(PacienteList);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    confirmDialog = TestBed.inject(ConfirmDialogService);

    fixture.detectChanges();
    httpMock.expectOne('/pacientes').flush([paciente]);
  });

  afterEach(() => httpMock.verify());

  it('não deve excluir quando o usuário cancela no diálogo de confirmação', async () => {
    const excluirPromise = (component as any).excluir(paciente, new Event('click'));
    confirmDialog.responder(false);
    await excluirPromise;

    httpMock.expectNone('/pacientes/1');
  });

  it('deve excluir o paciente quando o usuário confirma no diálogo', async () => {
    const excluirPromise = (component as any).excluir(paciente, new Event('click'));
    confirmDialog.responder(true);
    await excluirPromise;

    const req = httpMock.expectOne('/pacientes/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    expect((component as any).pacientes()).toEqual([]);
  });

  it('deve mostrar mensagem de erro (sem alert nativo) quando a exclusão falha', async () => {
    const excluirPromise = (component as any).excluir(paciente, new Event('click'));
    confirmDialog.responder(true);
    await excluirPromise;

    httpMock.expectOne('/pacientes/1').flush({}, { status: 500, statusText: 'Internal Server Error' });

    expect((component as any).deleteError()).toBe('Não foi possível excluir o paciente.');
  });
});
