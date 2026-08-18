import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MeService } from '../../../core/me/me.service';

@Component({
  selector: 'app-paciente-perfil',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './paciente-perfil.html',
  styleUrl: './paciente-perfil.scss',
})
export class PacientePerfil implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly meService = inject(MeService);

  protected readonly form = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
    senha: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]],
  });

  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly dataCriacao = signal<string | null>(null);

  ngOnInit(): void {
    this.meService.perfil().subscribe({
      next: (paciente) => {
        this.form.patchValue({ nome: paciente.nome, email: paciente.email });
        this.dataCriacao.set(paciente.dataCriacao);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Não foi possível carregar seu perfil.');
        this.loading.set(false);
      },
    });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.meService.atualizarPerfil(this.form.getRawValue()).subscribe({
      next: () => {
        this.saving.set(false);
        this.successMessage.set('Perfil atualizado com sucesso.');
      },
      error: (err: { status?: number }) => {
        this.saving.set(false);
        this.errorMessage.set(
          err.status === 409 ? 'Já existe uma conta com este email.' : 'Não foi possível salvar. Tente novamente.',
        );
      },
    });
  }
}
