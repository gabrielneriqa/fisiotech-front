import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ConsultaService } from '../../../core/consultas/consulta.service';
import { Paciente } from '../../../core/pacientes/paciente.model';
import { PacienteService } from '../../../core/pacientes/paciente.service';

@Component({
  selector: 'app-consulta-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './consulta-form.html',
  styleUrl: './consulta-form.scss',
})
export class ConsultaForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly consultaService = inject(ConsultaService);
  private readonly pacienteService = inject(PacienteService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly form = this.fb.nonNullable.group({
    dataHora: ['', Validators.required],
    tipo: ['PRESENCIAL' as 'PRESENCIAL' | 'ONLINE', Validators.required],
    convenio: [''],
    valor: [''],
  });

  protected readonly pacienteNome = signal('');
  protected readonly saving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly pacientes = signal<Paciente[]>([]);
  protected readonly buscaPaciente = signal('');
  protected readonly pacientesFiltrados = computed(() => {
    const termo = this.buscaPaciente().trim().toLowerCase();
    if (!termo) {
      return this.pacientes();
    }
    return this.pacientes().filter((p) => p.nome.toLowerCase().includes(termo));
  });

  private pacienteId: number | null = null;

  ngOnInit(): void {
    const pacienteIdParam = this.route.snapshot.queryParamMap.get('pacienteId');

    if (pacienteIdParam) {
      this.pacienteId = Number(pacienteIdParam);
      this.pacienteService.buscarPorId(this.pacienteId).subscribe({
        next: (paciente) => this.pacienteNome.set(paciente.nome),
        error: () => this.errorMessage.set('Paciente não encontrado.'),
      });
      return;
    }

    this.pacienteService.listarTodos().subscribe({
      next: (pacientes) => this.pacientes.set(pacientes),
      error: () => this.errorMessage.set('Não foi possível carregar os pacientes.'),
    });
  }

  protected onBuscaPacienteChange(event: Event): void {
    this.buscaPaciente.set((event.target as HTMLInputElement).value);
  }

  protected selecionarPaciente(paciente: Paciente): void {
    this.pacienteId = paciente.id;
    this.pacienteNome.set(paciente.nome);
  }

  protected submit(): void {
    if (this.form.invalid || !this.pacienteId) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);

    const { dataHora, tipo, convenio, valor } = this.form.getRawValue();

    this.consultaService
      .criar({
        pacienteId: this.pacienteId,
        dataHora,
        tipo,
        convenio: convenio.trim() || null,
        valor: valor ? Number(valor) : null,
      })
      .subscribe({
        next: (consultaId) => {
          this.saving.set(false);
          this.router.navigate(['/consultas', consultaId, 'wizard']);
        },
        error: () => {
          this.saving.set(false);
          this.errorMessage.set('Não foi possível criar a consulta.');
        },
      });
  }
}
