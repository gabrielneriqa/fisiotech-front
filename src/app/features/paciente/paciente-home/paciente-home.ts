import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MeService } from '../../../core/me/me.service';

@Component({
  selector: 'app-paciente-home',
  imports: [RouterLink, DatePipe],
  templateUrl: './paciente-home.html',
  styleUrl: './paciente-home.scss',
})
export class PacienteHome implements OnInit {
  private readonly meService = inject(MeService);

  protected readonly totalConsultas = signal<number | null>(null);
  protected readonly proximaConsulta = signal<string | null>(null);

  ngOnInit(): void {
    this.meService.minhasConsultas().subscribe({
      next: (consultas) => {
        this.totalConsultas.set(consultas.length);
        const proxima = consultas
          .filter((c) => c.status === 'AGENDADA' || c.status === 'CONFIRMADA')
          .sort((a, b) => a.dataHora.localeCompare(b.dataHora))[0];
        this.proximaConsulta.set(proxima?.dataHora ?? null);
      },
      error: () => this.totalConsultas.set(null),
    });
  }
}
