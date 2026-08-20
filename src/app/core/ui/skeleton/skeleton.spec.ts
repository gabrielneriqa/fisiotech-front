import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Skeleton } from './skeleton';

describe('Skeleton', () => {
  let fixture: ComponentFixture<Skeleton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Skeleton],
    }).compileComponents();

    fixture = TestBed.createComponent(Skeleton);
  });

  it('deve ter role="status" para leitores de tela', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.skeleton').getAttribute('role')).toBe('status');
  });

  it('variant "lines" (padrão) deve renderizar "count" barras', () => {
    fixture.componentRef.setInput('count', 4);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.skeleton__bar--line').length).toBe(4);
  });

  it('variant "list" deve renderizar uma linha com avatar por item', () => {
    fixture.componentRef.setInput('variant', 'list');
    fixture.componentRef.setInput('count', 2);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.skeleton__row').length).toBe(2);
    expect(fixture.nativeElement.querySelectorAll('.skeleton__avatar').length).toBe(2);
  });

  it('variant "form" deve renderizar um par label/input por item', () => {
    fixture.componentRef.setInput('variant', 'form');
    fixture.componentRef.setInput('count', 3);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.skeleton__field').length).toBe(3);
  });

  it('variant "thread" deve alternar bolhas entre esquerda e direita', () => {
    fixture.componentRef.setInput('variant', 'thread');
    fixture.componentRef.setInput('count', 4);
    fixture.detectChanges();

    const linhas = fixture.nativeElement.querySelectorAll('.skeleton__bubble-row');
    expect(linhas.length).toBe(4);
    expect(linhas[0].classList).not.toContain('skeleton__bubble-row--right');
    expect(linhas[1].classList).toContain('skeleton__bubble-row--right');
  });
});
