import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Consulta } from '../../../core/consultas/consulta.model';
import { MeService } from '../../../core/me/me.service';
import { Icon } from '../../../core/ui/icon/icon';
import { Skeleton } from '../../../core/ui/skeleton/skeleton';

@Component({
  selector: 'app-paciente-consulta-list',
  imports: [RouterLink, DatePipe, Icon, Skeleton],
  templateUrl: './paciente-consulta-list.html',
  styleUrl: './paciente-consulta-list.scss',
})
export class PacienteConsultaList implements OnInit {
  private readonly meService = inject(MeService);

  protected readonly consultas = signal<Consulta[]>([]);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.meService.minhasConsultas().subscribe({
      next: (consultas) => {
        this.consultas.set(consultas);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Não foi possível carregar suas consultas.');
        this.loading.set(false);
      },
    });
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
}
