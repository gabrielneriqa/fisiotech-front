import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { PacienteHome } from './paciente-home';

describe('PacienteHome', () => {
  let fixture: ComponentFixture<PacienteHome>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PacienteHome],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(PacienteHome);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('mostra o CTA de marcar a primeira consulta quando o paciente não tem nenhuma (regressão do F-04)', () => {
    fixture.detectChanges();
    httpMock.expectOne('/me/consultas').flush([]);
    httpMock.expectOne('/me/mensagens/caixa-entrada').flush([]);
    fixture.detectChanges();

    const cta = fixture.nativeElement.querySelector('.home__action');
    const cartaoConsultas = fixture.nativeElement.querySelector('a[href="/paciente/consultas"]');

    expect(cta).toBeTruthy();
    expect(cta.getAttribute('href')).toBe('/paciente/consultas/marcar');
    expect(cta.textContent).toContain('Marcar sua primeira consulta');
    expect(cartaoConsultas).toBeFalsy();
  });

  it('mostra o cartão normal de Minhas Consultas quando já existe ao menos uma', () => {
    fixture.detectChanges();
    httpMock.expectOne('/me/consultas').flush([
      { id: 1, dataHora: '2026-08-25T10:00:00', status: 'AGENDADA' },
    ] as any);
    httpMock.expectOne('/me/mensagens/caixa-entrada').flush([]);
    fixture.detectChanges();

    const cta = fixture.nativeElement.querySelector('.home__action');
    const cartaoConsultas = fixture.nativeElement.querySelector('a[href="/paciente/consultas"]');

    expect(cta).toBeFalsy();
    expect(cartaoConsultas).toBeTruthy();
    expect(cartaoConsultas.textContent).toContain('1 consulta');
  });
});
