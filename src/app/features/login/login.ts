import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { mensagemErro } from '../../core/forms/field-error';
import { AuthService } from '../../core/auth/auth.service';
import { homeRouteFor } from '../../core/auth/role-routes';
import { PacienteService } from '../../core/pacientes/paciente.service';

type Aba = 'login' | 'cadastro';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly pacienteService = inject(PacienteService);
  private readonly router = inject(Router);

  protected readonly mensagemErro = mensagemErro;

  protected readonly aba = signal<Aba>('login');

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', Validators.required],
  });

  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly formCadastro = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
    senha: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]],
  });

  protected readonly cadastrando = signal(false);
  protected readonly cadastroErrorMessage = signal<string | null>(null);

  protected selecionarAba(aba: Aba): void {
    this.aba.set(aba);
    this.errorMessage.set(null);
    this.cadastroErrorMessage.set(null);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    const { email, senha } = this.form.getRawValue();

    this.authService.login(email, senha).subscribe({
      next: (usuario) => {
        this.loading.set(false);
        this.router.navigateByUrl(homeRouteFor(usuario.role));
      },
      error: (err: { status?: number }) => {
        this.loading.set(false);
        this.errorMessage.set(
          err.status === 401 ? 'Usuário ou senha incorreta.' : 'Não foi possível entrar. Tente novamente.',
        );
      },
    });
  }

  protected submitCadastro(): void {
    if (this.formCadastro.invalid) {
      this.formCadastro.markAllAsTouched();
      return;
    }

    this.cadastrando.set(true);
    this.cadastroErrorMessage.set(null);

    const { nome, email, senha } = this.formCadastro.getRawValue();

    this.pacienteService.cadastrarPublico({ nome, email, senha }).subscribe({
      next: () => {
        this.authService.login(email, senha).subscribe({
          next: () => {
            this.cadastrando.set(false);
            this.router.navigateByUrl('/paciente/home');
          },
          error: () => {
            this.cadastrando.set(false);
            this.cadastroErrorMessage.set('Conta criada, mas não foi possível entrar automaticamente. Faça login.');
            this.aba.set('login');
          },
        });
      },
      error: (err: { status?: number }) => {
        this.cadastrando.set(false);
        this.cadastroErrorMessage.set(
          err.status === 409 ? 'Já existe uma conta com este email.' : 'Não foi possível criar a conta. Tente novamente.',
        );
      },
    });
  }
}
