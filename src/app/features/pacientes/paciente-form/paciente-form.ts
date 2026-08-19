import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Consulta } from '../../../core/consultas/consulta.model';
import { ConsultaService } from '../../../core/consultas/consulta.service';
import { PacienteService } from '../../../core/pacientes/paciente.service';
import { Icon } from '../../../core/ui/icon/icon';

@Component({
  selector: 'app-paciente-form',
  imports: [ReactiveFormsModule, RouterLink, DatePipe, Icon],
  templateUrl: './paciente-form.html',
  styleUrl: './paciente-form.scss',
})
export class PacienteForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly pacienteService = inject(PacienteService);
  private readonly consultaService = inject(ConsultaService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly form = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
    senha: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]],
    dataNascimento: [''],
    sexo: [''],
    profissao: [''],
    telefone: [''],
    endereco: [''],
    bairro: [''],
    foto: [''],
  });

  protected readonly editando = signal(false);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly dataCriacao = signal<string | null>(null);
  protected readonly consultas = signal<Consulta[]>([]);

  protected pacienteId: number | null = null;

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
        this.errorMessage.set('Não foi possível carregar o paciente.');
        this.loading.set(false);
      },
    });

    this.consultaService.listarTodos(this.pacienteId).subscribe({
      next: (consultas) => this.consultas.set(consultas),
      error: () => this.consultas.set([]),
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
    const camposNovos = {
      dataNascimento: raw.dataNascimento || null,
      sexo: raw.sexo || null,
      profissao: raw.profissao || null,
      telefone: raw.telefone || null,
      endereco: raw.endereco || null,
      bairro: raw.bairro || null,
      foto: raw.foto || null,
    };
    const request$ = this.pacienteId
      ? this.pacienteService.atualizar(this.pacienteId, {
          nome: raw.nome,
          email: raw.email,
          senha: raw.senha,
          ...camposNovos,
        })
      : this.pacienteService.criar({ nome: raw.nome, email: raw.email, senha: raw.senha });

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
