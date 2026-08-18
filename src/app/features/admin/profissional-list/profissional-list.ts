import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Profissional } from '../../../core/profissionais/profissional.model';
import { ProfissionalService } from '../../../core/profissionais/profissional.service';
import { Icon } from '../../../core/ui/icon/icon';

@Component({
  selector: 'app-profissional-list',
  imports: [RouterLink, Icon],
  templateUrl: './profissional-list.html',
  styleUrl: './profissional-list.scss',
})
export class ProfissionalList implements OnInit {
  private readonly profissionalService = inject(ProfissionalService);

  protected readonly profissionais = signal<Profissional[]>([]);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly filtro = signal('');

  protected readonly profissionaisFiltrados = computed(() => {
    const termo = this.filtro().trim().toLowerCase();
    if (!termo) {
      return this.profissionais();
    }
    return this.profissionais().filter(
      (p) =>
        p.nome.toLowerCase().includes(termo) ||
        p.email.toLowerCase().includes(termo) ||
        p.especialidade.toLowerCase().includes(termo),
    );
  });

  ngOnInit(): void {
    this.carregar();
  }

  protected onFiltroChange(event: Event): void {
    this.filtro.set((event.target as HTMLInputElement).value);
  }

  protected excluir(profissional: Profissional, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (!confirm(`Excluir o profissional ${profissional.nome}? Essa ação não pode ser desfeita.`)) {
      return;
    }

    this.profissionalService.deletar(profissional.id).subscribe({
      next: () => this.profissionais.update((lista) => lista.filter((p) => p.id !== profissional.id)),
      error: () =>
        alert('Não foi possível excluir. Pode ser que este profissional ainda tenha pacientes vinculados.'),
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

    this.profissionalService.listarTodos().subscribe({
      next: (profissionais) => {
        this.profissionais.set(profissionais);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Não foi possível carregar os profissionais.');
        this.loading.set(false);
      },
    });
  }
}
