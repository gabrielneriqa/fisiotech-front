import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';

import { Consulta } from '../../../core/consultas/consulta.model';
import { ConsultaWizard } from './consulta-wizard';

describe('ConsultaWizard', () => {
  let fixture: ComponentFixture<ConsultaWizard>;
  let component: ConsultaWizard;
  let httpMock: HttpTestingController;

  const clinicoVazio = {
    queixaPrincipal: null,
    historiaDoencaAtual: null,
    historicoSaude: null,
    cirurgias: null,
    cirurgiasDescricao: null,
    lesoesAnteriores: null,
    lesoesAnterioresDescricao: null,
    medicamentos: null,
  };
  const habitosVazio = { atividadeFisica: null, rotinaTrabalho: null, tabagismo: null, consumoAlcool: null };
  const exameVazio = { postura: null, amplitudeMovimento: null, palpacao: null, forcaMuscular: null };
  const diagnosticoVazio = { planoTratamento: null, objetivosTratamento: null };

  function consultaBase(overrides: Partial<Consulta> = {}): Consulta {
    return {
      id: 1,
      pacienteId: 1,
      pacienteNome: 'Joao Silva',
      profissionalId: 1,
      profissionalNome: 'Ana Souza',
      dataHora: '2026-08-25T10:00:00',
      tipo: 'PRESENCIAL',
      status: 'AGENDADA',
      foiRemarcada: false,
      convenio: null,
      valor: 150,
      quadroClinico: clinicoVazio,
      habitosVida: habitosVazio,
      exameFisico: exameVazio,
      diagnostico: diagnosticoVazio,
      dataCriacao: '2026-08-20T09:00:00',
      ...overrides,
    } as Consulta;
  }

  async function criarComponente() {
    await TestBed.configureTestingModule({
      imports: [ConsultaWizard],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsultaWizard);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  }

  afterEach(() => httpMock.verify());

  describe('retomar na etapa certa ao reabrir (regressão do F-05)', () => {
    it('retoma em "quadro-clinico" quando nada foi salvo ainda', async () => {
      await criarComponente();
      httpMock.expectOne('/consultas/1').flush(consultaBase());

      expect((component as any).step()).toBe('quadro-clinico');
    });

    it('retoma em "habitos-vida" quando quadro clínico já foi salvo', async () => {
      await criarComponente();
      httpMock.expectOne('/consultas/1').flush(
        consultaBase({ quadroClinico: { ...clinicoVazio, queixaPrincipal: '' } }),
      );

      expect((component as any).step()).toBe('habitos-vida');
    });

    it('retoma em "exame-fisico" quando quadro clínico e hábitos de vida já foram salvos', async () => {
      await criarComponente();
      httpMock.expectOne('/consultas/1').flush(
        consultaBase({
          quadroClinico: { ...clinicoVazio, queixaPrincipal: '' },
          habitosVida: { ...habitosVazio, atividadeFisica: '' },
        }),
      );

      expect((component as any).step()).toBe('exame-fisico');
    });

    it('retoma em "diagnostico" quando as três primeiras etapas já foram salvas', async () => {
      await criarComponente();
      httpMock.expectOne('/consultas/1').flush(
        consultaBase({
          quadroClinico: { ...clinicoVazio, queixaPrincipal: '' },
          habitosVida: { ...habitosVazio, atividadeFisica: '' },
          exameFisico: { ...exameVazio, postura: '' },
        }),
      );

      expect((component as any).step()).toBe('diagnostico');
    });

    it('retoma direto em "sucesso" quando a consulta já foi realizada', async () => {
      await criarComponente();
      httpMock.expectOne('/consultas/1').flush(
        consultaBase({
          status: 'REALIZADA',
          quadroClinico: { ...clinicoVazio, queixaPrincipal: '' },
          habitosVida: { ...habitosVazio, atividadeFisica: '' },
          exameFisico: { ...exameVazio, postura: '' },
          diagnostico: { ...diagnosticoVazio, planoTratamento: '' },
        }),
      );

      expect((component as any).step()).toBe('sucesso');
    });
  });

  describe('navegação "voltar"', () => {
    beforeEach(async () => {
      await criarComponente();
      httpMock.expectOne('/consultas/1').flush(
        consultaBase({
          quadroClinico: { ...clinicoVazio, queixaPrincipal: '' },
          habitosVida: { ...habitosVazio, atividadeFisica: '' },
        }),
      );
      // retomou em 'exame-fisico'
    });

    it('stepNumber reflete a posição da etapa atual (1 a 4)', () => {
      expect((component as any).stepNumber()).toBe(3);
    });

    it('voltar() move uma etapa para trás', () => {
      (component as any).voltar();
      expect((component as any).step()).toBe('habitos-vida');
    });

    it('irParaEtapa move para uma etapa anterior já alcançada', () => {
      (component as any).irParaEtapa('quadro-clinico');
      expect((component as any).step()).toBe('quadro-clinico');
    });

    it('irParaEtapa não permite pular para uma etapa futura ainda não alcançada', () => {
      (component as any).irParaEtapa('diagnostico');
      expect((component as any).step()).toBe('exame-fisico');
    });
  });
});
