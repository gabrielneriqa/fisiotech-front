import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';
import { Consulta } from '../../core/consultas/consulta.model';
import { ConsultaService } from '../../core/consultas/consulta.service';
import { PacienteService } from '../../core/pacientes/paciente.service';
import { avatarTint } from '../../core/ui/avatar-color';
import { Icon } from '../../core/ui/icon/icon';
import { Skeleton } from '../../core/ui/skeleton/skeleton';

@Component({
  selector: 'app-home',
  imports: [RouterLink, DatePipe, Icon, Skeleton],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly consultaService = inject(ConsultaService);
  private readonly pacienteService = inject(PacienteService);

  protected readonly currentUser = this.authService.currentUser;
  protected readonly avatarTint = avatarTint;

  protected readonly consultas = signal<Consulta[]>([]);
  protected readonly loadingConsultas = signal(true);
  protected readonly totalPacientes = signal(0);
  protected readonly loadingPacientes = signal(true);

  protected readonly proximaConsulta = computed<Consulta | null>(() => {
    const agora = Date.now();
    const proximas = this.consultas()
      .filter((c) => (c.status === 'AGENDADA' || c.status === 'CONFIRMADA') && new Date(c.dataHora).getTime() >= agora)
      .sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime());
    return proximas[0] ?? null;
  });

  protected readonly consultasHoje = computed(() =>
    this.consultas()
      .filter((c) => this.mesmoDia(c.dataHora, new Date()) && c.status !== 'CANCELADA')
      .sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime()),
  );

  protected readonly agendaHoje = computed(() =>
    this.consultasHoje().filter((c) => c.id !== this.proximaConsulta()?.id),
  );

  ngOnInit(): void {
    this.consultaService.listarTodos().subscribe({
      next: (consultas) => {
        this.consultas.set(consultas);
        this.loadingConsultas.set(false);
      },
      error: () => this.loadingConsultas.set(false),
    });

    this.pacienteService.listarTodos().subscribe({
      next: (pacientes) => {
        this.totalPacientes.set(pacientes.length);
        this.loadingPacientes.set(false);
      },
      error: () => this.loadingPacientes.set(false),
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

  protected subtitulo(consulta: Consulta): string {
    const tipo = consulta.tipo === 'ONLINE' ? 'Online' : 'Presencial';
    return `${tipo} · ${consulta.convenio ?? 'Particular'}`;
  }

  protected countdown(consulta: Consulta): string {
    const dataConsulta = new Date(consulta.dataHora);
    if (!this.mesmoDia(consulta.dataHora, new Date())) {
      return dataConsulta.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    }

    const diffMin = Math.round((dataConsulta.getTime() - Date.now()) / 60000);
    if (diffMin <= 0) {
      return 'agora';
    }
    if (diffMin < 60) {
      return `em ${diffMin} min`;
    }
    const horas = Math.floor(diffMin / 60);
    const minutos = diffMin % 60;
    return minutos > 0 ? `em ${horas}h ${minutos}min` : `em ${horas}h`;
  }

  private mesmoDia(dataHora: string, referencia: Date): boolean {
    const data = new Date(dataHora);
    return (
      data.getFullYear() === referencia.getFullYear() &&
      data.getMonth() === referencia.getMonth() &&
      data.getDate() === referencia.getDate()
    );
  }
}
