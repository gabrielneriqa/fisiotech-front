import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PacienteService } from '../../core/pacientes/paciente.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private readonly pacienteService = inject(PacienteService);

  protected readonly totalPacientes = signal<number | null>(null);

  ngOnInit(): void {
    this.pacienteService.listarTodos().subscribe({
      next: (pacientes) => this.totalPacientes.set(pacientes.length),
      error: () => this.totalPacientes.set(null),
    });
  }
}
