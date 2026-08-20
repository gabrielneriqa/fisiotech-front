import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmDialog } from './confirm-dialog';
import { ConfirmDialogService } from './confirm-dialog.service';

describe('ConfirmDialog', () => {
  let fixture: ComponentFixture<ConfirmDialog>;
  let service: ConfirmDialogService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDialog);
    service = TestBed.inject(ConfirmDialogService);
    fixture.detectChanges();
  });

  it('não deve renderizar nada quando não há diálogo aberto', () => {
    expect(fixture.nativeElement.querySelector('.confirm-overlay')).toBeNull();
  });

  it('deve renderizar título e mensagem quando um diálogo é aberto', () => {
    service.confirm({ titulo: 'Excluir paciente', mensagem: 'Essa ação não pode ser desfeita.' });
    fixture.detectChanges();

    const overlay = fixture.nativeElement.querySelector('.confirm-overlay');
    expect(overlay).toBeTruthy();
    expect(overlay.querySelector('.confirm-card__title').textContent).toContain('Excluir paciente');
    expect(overlay.querySelector('.confirm-card__message').textContent).toContain('Essa ação não pode ser desfeita.');
  });

  it('deve usar os rótulos padrão quando não informados', () => {
    service.confirm({ titulo: 'Título', mensagem: 'Mensagem' });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.confirm-card__cancel').textContent.trim()).toBe('Cancelar');
    expect(fixture.nativeElement.querySelector('.confirm-card__confirm').textContent.trim()).toBe('Confirmar');
  });

  it('deve usar rótulos customizados quando informados', () => {
    service.confirm({ titulo: 'Título', mensagem: 'Mensagem', cancelarLabel: 'Voltar', confirmarLabel: 'Excluir' });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.confirm-card__cancel').textContent.trim()).toBe('Voltar');
    expect(fixture.nativeElement.querySelector('.confirm-card__confirm').textContent.trim()).toBe('Excluir');
  });

  it('clicar em confirmar deve resolver a promise com true e fechar o diálogo', async () => {
    const promessa = service.confirm({ titulo: 'Título', mensagem: 'Mensagem' });
    fixture.detectChanges();

    fixture.nativeElement.querySelector('.confirm-card__confirm').click();
    fixture.detectChanges();

    await expect(promessa).resolves.toBe(true);
    expect(fixture.nativeElement.querySelector('.confirm-overlay')).toBeNull();
  });

  it('clicar em cancelar deve resolver a promise com false e fechar o diálogo', async () => {
    const promessa = service.confirm({ titulo: 'Título', mensagem: 'Mensagem' });
    fixture.detectChanges();

    fixture.nativeElement.querySelector('.confirm-card__cancel').click();
    fixture.detectChanges();

    await expect(promessa).resolves.toBe(false);
  });

  it('clicar fora do card (no overlay) deve cancelar', async () => {
    const promessa = service.confirm({ titulo: 'Título', mensagem: 'Mensagem' });
    fixture.detectChanges();

    fixture.nativeElement.querySelector('.confirm-overlay').click();
    fixture.detectChanges();

    await expect(promessa).resolves.toBe(false);
  });

  it('clicar dentro do card não deve fechar o diálogo', () => {
    service.confirm({ titulo: 'Título', mensagem: 'Mensagem' });
    fixture.detectChanges();

    fixture.nativeElement.querySelector('.confirm-card').click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.confirm-overlay')).toBeTruthy();
  });
});
