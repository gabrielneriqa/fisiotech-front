import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Paciente } from '../../../core/pacientes/paciente.model';
import { PacienteAdminService } from '../../../core/pacientes/paciente-admin.service';

@Component({
  selector: 'app-admin-paciente-list',
  imports: [RouterLink],
  templateUrl: './paciente-list.html',
  styleUrl: './paciente-list.scss',
})
export class PacienteList implements OnInit {
  private readonly pacienteAdminService = inject(PacienteAdminService);

  protected readonly pacientes = signal<Paciente[]>([]);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly filtro = signal('');

  protected readonly pacientesFiltrados = computed(() => {
    const termo = this.filtro().trim().toLowerCase();
    if (!termo) {
      return this.pacientes();
    }
    return this.pacientes().filter(
      (paciente) =>
        paciente.nome.toLowerCase().includes(termo) ||
        paciente.email.toLowerCase().includes(termo) ||
        paciente.profissionalNome.toLowerCase().includes(termo),
    );
  });

  ngOnInit(): void {
    this.carregar();
  }

  protected onFiltroChange(event: Event): void {
    this.filtro.set((event.target as HTMLInputElement).value);
  }

  protected iniciais(nome: string): string {
    return nome
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((parte) => parte[0]?.toUpperCase() ?? '')
      .join('');
  }

  private carregar(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.pacienteAdminService.listarTodos().subscribe({
      next: (pacientes) => {
        this.pacientes.set(pacientes);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Não foi possível carregar os pacientes.');
        this.loading.set(false);
      },
    });
  }
}
