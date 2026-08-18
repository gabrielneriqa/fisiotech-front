import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { PacienteService } from '../../../core/pacientes/paciente.service';

@Component({
  selector: 'app-paciente-form',
  imports: [ReactiveFormsModule, RouterLink, DatePipe],
  templateUrl: './paciente-form.html',
  styleUrl: './paciente-form.scss',
})
export class PacienteForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly pacienteService = inject(PacienteService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly form = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
    senha: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]],
  });

  protected readonly editando = signal(false);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly dataCriacao = signal<string | null>(null);

  private pacienteId: number | null = null;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      return;
    }

    this.pacienteId = Number(idParam);
    this.editando.set(true);
    this.loading.set(true);

    this.pacienteService.buscarPorId(this.pacienteId).subscribe({
      next: (paciente) => {
        this.form.patchValue({ nome: paciente.nome, email: paciente.email });
        this.dataCriacao.set(paciente.dataCriacao);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Não foi possível carregar o paciente.');
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

    const request = this.form.getRawValue();
    const request$ = this.pacienteId
      ? this.pacienteService.atualizar(this.pacienteId, request)
      : this.pacienteService.criar(request);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigateByUrl('/pacientes');
      },
      error: (err: { status?: number }) => {
        this.saving.set(false);
        this.errorMessage.set(
          err.status === 409
            ? 'Já existe um paciente cadastrado com este email.'
            : 'Não foi possível salvar. Confira os dados e tente novamente.',
        );
      },
    });
  }

  protected excluir(): void {
    if (!this.pacienteId) {
      return;
    }

    if (!confirm('Excluir este paciente? Essa ação não pode ser desfeita.')) {
      return;
    }

    this.pacienteService.deletar(this.pacienteId).subscribe({
      next: () => this.router.navigateByUrl('/pacientes'),
      error: () => this.errorMessage.set('Não foi possível excluir o paciente.'),
    });
  }
}
