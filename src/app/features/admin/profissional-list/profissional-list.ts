import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Profissional } from '../../../core/profissionais/profissional.model';
import { ProfissionalService } from '../../../core/profissionais/profissional.service';
import { Icon } from '../../../core/ui/icon/icon';
import { Skeleton } from '../../../core/ui/skeleton/skeleton';

@Component({
  selector: 'app-profissional-list',
  imports: [RouterLink, Icon, Skeleton],
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

  protected readonly totalEspecialidades = computed(
    () => new Set(this.profissionais().map((p) => p.especialidade)).size,
  );

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
