import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Paciente } from '../../../core/pacientes/paciente.model';
import { PacienteService } from '../../../core/pacientes/paciente.service';
import { ConfirmDialogService } from '../../../core/ui/confirm-dialog/confirm-dialog.service';
import { Icon } from '../../../core/ui/icon/icon';
import { Skeleton } from '../../../core/ui/skeleton/skeleton';

@Component({
  selector: 'app-paciente-list',
  imports: [RouterLink, Icon, Skeleton],
  templateUrl: './paciente-list.html',
  styleUrl: './paciente-list.scss',
})
export class PacienteList implements OnInit {
  private readonly pacienteService = inject(PacienteService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  protected readonly pacientes = signal<Paciente[]>([]);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly deleteError = signal<string | null>(null);
  protected readonly filtro = signal('');

  protected readonly pacientesFiltrados = computed(() => {
    const termo = this.filtro().trim().toLowerCase();
    if (!termo) {
      return this.pacientes();
    }
    return this.pacientes().filter(
      (paciente) =>
        paciente.nome.toLowerCase().includes(termo) || paciente.email.toLowerCase().includes(termo),
    );
  });

  ngOnInit(): void {
    this.carregar();
  }

  protected onFiltroChange(event: Event): void {
    this.filtro.set((event.target as HTMLInputElement).value);
  }

  protected async excluir(paciente: Paciente, event: Event): Promise<void> {
    event.preventDefault();
    event.stopPropagation();

    const confirmado = await this.confirmDialog.confirm({
      titulo: 'Excluir paciente',
      mensagem: `Excluir o paciente ${paciente.nome}? Essa ação não pode ser desfeita.`,
      confirmarLabel: 'Excluir',
    });
    if (!confirmado) {
      return;
    }

    this.deleteError.set(null);
    this.pacienteService.deletar(paciente.id).subscribe({
      next: () => this.pacientes.update((lista) => lista.filter((p) => p.id !== paciente.id)),
      error: () => this.deleteError.set('Não foi possível excluir o paciente.'),
    });
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

    this.pacienteService.listarTodos().subscribe({
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
