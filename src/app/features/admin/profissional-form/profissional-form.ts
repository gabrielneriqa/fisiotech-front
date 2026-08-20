import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { mensagemErro } from '../../../core/forms/field-error';
import { ProfissionalService } from '../../../core/profissionais/profissional.service';

@Component({
  selector: 'app-profissional-form',
  imports: [ReactiveFormsModule, RouterLink, DatePipe],
  templateUrl: './profissional-form.html',
  styleUrl: './profissional-form.scss',
})
export class ProfissionalForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly profissionalService = inject(ProfissionalService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly form = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
    senha: ['', [Validators.minLength(8), Validators.maxLength(100)]],
    registroProfissional: ['', [Validators.required, Validators.maxLength(20)]],
    especialidade: ['', [Validators.required, Validators.maxLength(120)]],
    valorConsultaParticular: [null as number | null],
    conveniosAceitos: [''],
    foto: [''],
    dataNascimento: [''],
    sexo: [''],
    telefone: [''],
  });

  protected readonly editando = signal(false);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly dataCriacao = signal<string | null>(null);

  private profissionalId: number | null = null;

  protected readonly mensagemErro = mensagemErro;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.form.controls.senha.addValidators(Validators.required);
      this.form.controls.senha.updateValueAndValidity();
      return;
    }

    this.profissionalId = Number(idParam);
    this.editando.set(true);
    this.loading.set(true);

    this.profissionalService.buscarPorId(this.profissionalId).subscribe({
      next: (profissional) => {
        this.form.patchValue({
          nome: profissional.nome,
          email: profissional.email,
          registroProfissional: profissional.registroProfissional,
          especialidade: profissional.especialidade,
          valorConsultaParticular: profissional.valorConsultaParticular,
          conveniosAceitos: profissional.conveniosAceitos.join(', '),
          foto: profissional.foto ?? '',
          dataNascimento: profissional.dataNascimento ?? '',
          sexo: profissional.sexo ?? '',
          telefone: profissional.telefone ?? '',
        });
        this.dataCriacao.set(profissional.dataCriacao);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Não foi possível carregar o profissional.');
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

    const raw = this.form.getRawValue();
    const request = {
      nome: raw.nome,
      email: raw.email,
      senha: raw.senha,
      registroProfissional: raw.registroProfissional,
      especialidade: raw.especialidade,
      valorConsultaParticular: raw.valorConsultaParticular,
      conveniosAceitos: raw.conveniosAceitos
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean),
      foto: raw.foto || null,
      dataNascimento: raw.dataNascimento || null,
      sexo: raw.sexo || null,
      telefone: raw.telefone || null,
    };
    const request$ = this.profissionalId
      ? this.profissionalService.atualizar(this.profissionalId, {
          ...request,
          senha: raw.senha.trim() ? raw.senha : null,
        })
      : this.profissionalService.criar(request);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigateByUrl('/admin/profissionais');
      },
      error: (err: { status?: number }) => {
        this.saving.set(false);
        this.errorMessage.set(
          err.status === 409
            ? 'Já existe um profissional cadastrado com este email ou registro profissional.'
            : 'Não foi possível salvar. Confira os dados e tente novamente.',
        );
      },
    });
  }

  protected excluir(): void {
    if (!this.profissionalId) {
      return;
    }

    if (!confirm('Excluir este profissional? Essa ação não pode ser desfeita.')) {
      return;
    }

    this.profissionalService.deletar(this.profissionalId).subscribe({
      next: () => this.router.navigateByUrl('/admin/profissionais'),
      error: () =>
        this.errorMessage.set(
          'Não foi possível excluir. Pode ser que este profissional ainda tenha pacientes vinculados.',
        ),
    });
  }
}
