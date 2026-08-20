import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';
import { mensagemErro } from '../../core/forms/field-error';
import { ProfissionalService } from '../../core/profissionais/profissional.service';

function senhasIguaisValidator(control: AbstractControl): ValidationErrors | null {
  const novaSenha = control.get('novaSenha')?.value;
  const confirmarNovaSenha = control.get('confirmarNovaSenha')?.value;

  if (!novaSenha || !confirmarNovaSenha || novaSenha === confirmarNovaSenha) {
    return null;
  }

  control.get('confirmarNovaSenha')?.setErrors({ senhasDiferentes: true });
  return null;
}

@Component({
  selector: 'app-profissional-senha',
  imports: [ReactiveFormsModule],
  templateUrl: './profissional-senha.html',
  styleUrl: './profissional-senha.scss',
})
export class ProfissionalSenha {
  private readonly fb = inject(FormBuilder);
  private readonly profissionalService = inject(ProfissionalService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly mensagemErro = mensagemErro;

  protected readonly form = this.fb.nonNullable.group(
    {
      senhaAtual: ['', [Validators.required]],
      novaSenha: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]],
      confirmarNovaSenha: ['', [Validators.required]],
    },
    { validators: senhasIguaisValidator },
  );

  protected readonly saving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);

  protected mensagemErroConfirmacao(): string | null {
    const control = this.form.controls.confirmarNovaSenha;
    if (!control.touched && !control.dirty) {
      return null;
    }
    if (control.errors?.['senhasDiferentes']) {
      return 'As senhas não coincidem.';
    }
    return mensagemErro(control);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const { senhaAtual, novaSenha } = this.form.getRawValue();
    const email = this.authService.currentUser()?.email;

    this.profissionalService.alterarPropriaSenha({ senhaAtual, novaSenha }).subscribe({
      next: () => {
        this.form.reset();

        if (!email) {
          this.saving.set(false);
          this.successMessage.set('Senha alterada com sucesso.');
          return;
        }

        // As credenciais Basic Auth em cache ficam desatualizadas após a troca -
        // refaz o login com a nova senha pra não deixar a sessão presa com a senha antiga.
        this.authService.login(email, novaSenha).subscribe({
          next: () => {
            this.saving.set(false);
            this.successMessage.set('Senha alterada com sucesso.');
            setTimeout(() => this.router.navigateByUrl('/home'), 1200);
          },
          error: () => {
            this.saving.set(false);
            this.successMessage.set('Senha alterada com sucesso. Faça login novamente.');
            this.authService.logout();
            setTimeout(() => this.router.navigateByUrl('/login'), 1200);
          },
        });
      },
      error: (err: { status?: number }) => {
        this.saving.set(false);
        this.errorMessage.set(
          err.status === 400 ? 'Senha atual incorreta.' : 'Não foi possível alterar a senha. Tente novamente.',
        );
      },
    });
  }
}
