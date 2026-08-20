import { TestBed } from '@angular/core/testing';

import { ConfirmDialogService } from './confirm-dialog.service';

describe('ConfirmDialogService', () => {
  let service: ConfirmDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfirmDialogService);
  });

  it('não deve ter diálogo aberto inicialmente', () => {
    expect(service.current()).toBeNull();
  });

  it('confirm deve abrir o diálogo com as opções passadas', () => {
    service.confirm({ titulo: 'Excluir paciente', mensagem: 'Tem certeza?' });

    expect(service.current()?.options.titulo).toBe('Excluir paciente');
    expect(service.current()?.options.mensagem).toBe('Tem certeza?');
  });

  it('responder(true) deve resolver a promise com true e fechar o diálogo', async () => {
    const promessa = service.confirm({ titulo: 'Excluir', mensagem: 'Tem certeza?' });

    service.responder(true);

    await expect(promessa).resolves.toBe(true);
    expect(service.current()).toBeNull();
  });

  it('responder(false) deve resolver a promise com false e fechar o diálogo', async () => {
    const promessa = service.confirm({ titulo: 'Excluir', mensagem: 'Tem certeza?' });

    service.responder(false);

    await expect(promessa).resolves.toBe(false);
    expect(service.current()).toBeNull();
  });

  it('responder sem diálogo aberto não deve lançar erro', () => {
    expect(() => service.responder(true)).not.toThrow();
  });
});
