import { AbstractControl } from '@angular/forms';

export function mensagemErro(control: AbstractControl | null | undefined): string | null {
  if (!control || !control.invalid || (!control.touched && !control.dirty)) {
    return null;
  }

  const errors = control.errors;
  if (!errors) {
    return null;
  }

  if (errors['required']) {
    return 'Este campo é obrigatório.';
  }
  if (errors['email']) {
    return 'Email inválido.';
  }
  if (errors['minlength']) {
    return `Deve ter pelo menos ${errors['minlength'].requiredLength} caracteres.`;
  }
  if (errors['maxlength']) {
    return `Deve ter no máximo ${errors['maxlength'].requiredLength} caracteres.`;
  }

  return 'Campo inválido.';
}
