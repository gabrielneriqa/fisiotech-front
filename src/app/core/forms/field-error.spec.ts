import { FormControl, Validators } from '@angular/forms';

import { mensagemErro } from './field-error';

describe('mensagemErro', () => {
  it('deve retornar null para um controle nulo ou indefinido', () => {
    expect(mensagemErro(null)).toBeNull();
    expect(mensagemErro(undefined)).toBeNull();
  });

  it('deve retornar null quando o controle é válido', () => {
    const control = new FormControl('valor', Validators.required);
    expect(mensagemErro(control)).toBeNull();
  });

  it('deve retornar null quando o controle é inválido mas ainda não foi tocado nem alterado', () => {
    const control = new FormControl('', Validators.required);
    expect(control.invalid).toBe(true);
    expect(mensagemErro(control)).toBeNull();
  });

  it('deve retornar a mensagem de obrigatório quando tocado e vazio', () => {
    const control = new FormControl('', Validators.required);
    control.markAsTouched();
    expect(mensagemErro(control)).toBe('Este campo é obrigatório.');
  });

  it('deve retornar a mensagem de obrigatório quando "dirty" mesmo sem estar tocado', () => {
    const control = new FormControl('', Validators.required);
    control.markAsDirty();
    expect(mensagemErro(control)).toBe('Este campo é obrigatório.');
  });

  it('deve retornar a mensagem de email inválido', () => {
    const control = new FormControl('nao-e-email', Validators.email);
    control.markAsTouched();
    expect(mensagemErro(control)).toBe('Email inválido.');
  });

  it('deve retornar a mensagem de tamanho mínimo com o valor exigido', () => {
    const control = new FormControl('ab', Validators.minLength(8));
    control.markAsTouched();
    expect(mensagemErro(control)).toBe('Deve ter pelo menos 8 caracteres.');
  });

  it('deve retornar a mensagem de tamanho máximo com o valor exigido', () => {
    const control = new FormControl('a'.repeat(10), Validators.maxLength(5));
    control.markAsTouched();
    expect(mensagemErro(control)).toBe('Deve ter no máximo 5 caracteres.');
  });

  it('deve retornar mensagem genérica para um erro de validação customizado', () => {
    const control = new FormControl('valor');
    control.setErrors({ algumErroCustomizado: true });
    control.markAsTouched();
    expect(mensagemErro(control)).toBe('Campo inválido.');
  });
});
