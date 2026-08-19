import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { mensagemErro } from '../../../core/forms/field-error';
import { PacienteAdminService } from '../../../core/pacientes/paciente-admin.service';
import { Profissional } from '../../../core/profissionais/profissional.model';
import { ProfissionalService } from '../../../core/profissionais/profissional.service';

@Component({
  selector: 'app-admin-paciente-form',
  imports: [ReactiveFormsModule, RouterLink, DatePipe],
  templateUrl: './paciente-form.html',
  styleUrl: './paciente-form.scss',
})
export class PacienteForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly pacienteAdminService = inject(PacienteAdminService);
  private readonly profissionalService = inject(ProfissionalService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly form = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
    senha: ['', [Validators.minLength(8), Validators.maxLength(100)]],
    profissionalId: [null as number | null, [Validators.required]],
  });

  protected readonly profissionais = signal<Profissional[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly dataCriacao = signal<string | null>(null);

  protected readonly mensagemErro = mensagemErro;

  private pacienteId!: number;

  ngOnInit(): void {
    this.pacienteId = Number(this.route.snapshot.paramMap.get('id'));

    this.profissionalService.listarTodos().subscribe({
      next: (profissionais) => this.profissionais.set(profissionais),
      error: () => this.errorMessage.set('Não foi possível carregar a lista de profissionais.'),
    });

    this.pacienteAdminService.buscarPorId(this.pacienteId).subscribe({
      next: (paciente) => {
        this.form.patchValue({
          nome: paciente.nome,
          email: paciente.email,
          profissionalId: paciente.profissionalId,
        });
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

    const { nome, email, senha, profissionalId } = this.form.getRawValue();

    this.pacienteAdminService
      .atualizar(this.pacienteId, {
        nome,
        email,
        senha: senha.trim() ? senha : null,
        profissionalId: profissionalId!,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.router.navigateByUrl('/admin/pacientes');
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
}
