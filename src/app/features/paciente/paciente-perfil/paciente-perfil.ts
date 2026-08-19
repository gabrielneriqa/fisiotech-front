import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { mensagemErro } from '../../../core/forms/field-error';
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

  protected readonly mensagemErro = mensagemErro;

  protected readonly form = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
    dataNascimento: [''],
    sexo: [''],
    profissao: [''],
    telefone: [''],
    endereco: [''],
    bairro: [''],
    foto: [''],
  });

  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly dataCriacao = signal<string | null>(null);

  ngOnInit(): void {
    this.meService.perfil().subscribe({
      next: (paciente) => {
        this.form.patchValue({
          nome: paciente.nome,
          email: paciente.email,
          dataNascimento: paciente.dataNascimento ?? '',
          sexo: paciente.sexo ?? '',
          profissao: paciente.profissao ?? '',
          telefone: paciente.telefone ?? '',
          endereco: paciente.endereco ?? '',
          bairro: paciente.bairro ?? '',
          foto: paciente.foto ?? '',
        });
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

    const raw = this.form.getRawValue();

    this.meService
      .atualizarPerfil({
        nome: raw.nome,
        email: raw.email,
        dataNascimento: raw.dataNascimento || null,
        sexo: raw.sexo || null,
        profissao: raw.profissao || null,
        telefone: raw.telefone || null,
        endereco: raw.endereco || null,
        bairro: raw.bairro || null,
        foto: raw.foto || null,
      })
      .subscribe({
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
