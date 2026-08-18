import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', Validators.required],
  });

  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    const { email, senha } = this.form.getRawValue();

    this.authService.login(email, senha).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigateByUrl('/home');
      },
      error: (err: { status?: number }) => {
        this.loading.set(false);
        this.errorMessage.set(
          err.status === 401 ? 'Email ou senha inválidos.' : 'Não foi possível entrar. Tente novamente.',
        );
      },
    });
  }
}
