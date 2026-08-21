import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { PacienteList } from './paciente-list';

describe('PacienteList', () => {
  let fixture: ComponentFixture<PacienteList>;
  let httpMock: HttpTestingController;

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
    httpMock = TestBed.inject(HttpTestingController);

    fixture.detectChanges();
    httpMock.expectOne('/pacientes').flush([paciente]);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('mostra o paciente na lista com um link para o detalhe (a exclusão agora fica na tela de edição)', () => {
    const link = fixture.nativeElement.querySelector('a[href="/pacientes/1"]');

    expect(link).toBeTruthy();
    expect(link.textContent).toContain('Joao Silva');
    expect(fixture.nativeElement.querySelector('.paciente-card__delete')).toBeFalsy();
  });
});
