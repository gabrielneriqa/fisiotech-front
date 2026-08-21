import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';
import { Consulta } from '../../../core/consultas/consulta.model';
import { MeService } from '../../../core/me/me.service';
import { avatarTint } from '../../../core/ui/avatar-color';
import { Icon } from '../../../core/ui/icon/icon';

@Component({
  selector: 'app-paciente-home',
  imports: [RouterLink, DatePipe, Icon],
  templateUrl: './paciente-home.html',
  styleUrl: './paciente-home.scss',
})
export class PacienteHome implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly meService = inject(MeService);

  protected readonly currentUser = this.authService.currentUser;
  protected readonly avatarTint = avatarTint;

  protected readonly totalConsultas = signal<number | null>(null);
  protected readonly totalAgendadas = signal(0);
  protected readonly proximaConsulta = signal<Consulta | null>(null);
  protected readonly mensagensNaoLidas = signal(false);

  ngOnInit(): void {
    this.meService.minhasConsultas().subscribe({
      next: (consultas) => {
        this.totalConsultas.set(consultas.length);
        const agendadasEConfirmadas = consultas.filter((c) => c.status === 'AGENDADA' || c.status === 'CONFIRMADA');
        this.totalAgendadas.set(agendadasEConfirmadas.length);
        const proxima = [...agendadasEConfirmadas].sort((a, b) => a.dataHora.localeCompare(b.dataHora))[0];
        this.proximaConsulta.set(proxima ?? null);
      },
      error: () => this.totalConsultas.set(null),
    });

    this.meService.minhasConversas().subscribe({
      next: (conversas) => {
        this.mensagensNaoLidas.set(conversas.some((c) => c.ultimoAutor === 'PROFISSIONAL'));
      },
      error: () => this.mensagensNaoLidas.set(false),
    });
  }

  protected iniciais(nome: string | undefined): string {
    if (!nome) {
      return '';
    }
    return nome
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((parte) => parte[0]?.toUpperCase() ?? '')
      .join('');
  }

  protected tipoLabel(consulta: Consulta): string {
    return consulta.tipo === 'ONLINE' ? 'Online' : 'Presencial';
  }
}
