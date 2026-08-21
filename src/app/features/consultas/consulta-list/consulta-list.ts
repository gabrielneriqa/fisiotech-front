import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Consulta } from '../../../core/consultas/consulta.model';
import { ConsultaService } from '../../../core/consultas/consulta.service';
import { Icon } from '../../../core/ui/icon/icon';
import { Skeleton } from '../../../core/ui/skeleton/skeleton';

type Filtro = 'todas' | 'agendadas' | 'canceladas' | 'remarcadas';

interface GrupoConsultas {
  data: string;
  label: string;
  consultas: Consulta[];
}

@Component({
  selector: 'app-consulta-list',
  imports: [RouterLink, DatePipe, Icon, Skeleton],
  templateUrl: './consulta-list.html',
  styleUrl: './consulta-list.scss',
})
export class ConsultaList implements OnInit {
  private readonly consultaService = inject(ConsultaService);

  protected readonly consultas = signal<Consulta[]>([]);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly filtro = signal<Filtro>('todas');

  protected readonly consultasFiltradas = computed(() => {
    const filtro = this.filtro();
    const consultas = this.consultas();

    if (filtro === 'todas') {
      return consultas;
    }
    if (filtro === 'agendadas') {
      return consultas.filter((c) => c.status === 'AGENDADA' || c.status === 'CONFIRMADA');
    }
    if (filtro === 'canceladas') {
      return consultas.filter((c) => c.status === 'CANCELADA');
    }
    return consultas.filter((c) => c.foiRemarcada);
  });

  protected readonly grupos = computed<GrupoConsultas[]>(() => {
    const porData = new Map<string, Consulta[]>();
    for (const consulta of this.consultasFiltradas()) {
      const chave = consulta.dataHora.slice(0, 10);
      const lista = porData.get(chave) ?? [];
      lista.push(consulta);
      porData.set(chave, lista);
    }

    return Array.from(porData.entries())
      .sort(([a], [b]) => (a < b ? 1 : a > b ? -1 : 0))
      .map(([data, consultas]) => ({
        data,
        label: this.grupoLabel(data),
        consultas: [...consultas].sort((a, b) => a.dataHora.localeCompare(b.dataHora)),
      }));
  });

  ngOnInit(): void {
    this.consultaService.listarTodos().subscribe({
      next: (consultas) => {
        this.consultas.set(consultas);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Não foi possível carregar as consultas.');
        this.loading.set(false);
      },
    });
  }

  protected selecionarFiltro(filtro: Filtro): void {
    this.filtro.set(filtro);
  }

  protected statusLabel(status: string): string {
    const labels: Record<string, string> = {
      AGENDADA: 'Agendada',
      CONFIRMADA: 'Confirmada',
      REALIZADA: 'Realizada',
      CANCELADA: 'Cancelada',
    };
    return labels[status] ?? status;
  }

  protected tipoLabel(tipo: string): string {
    return tipo === 'ONLINE' ? 'Online' : 'Presencial';
  }

  private grupoLabel(data: string): string {
    const referencia = new Date(`${data}T00:00:00`);
    return referencia
      .toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })
      .toUpperCase();
  }
}
