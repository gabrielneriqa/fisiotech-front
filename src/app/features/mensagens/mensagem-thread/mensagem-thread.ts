import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Mensagem } from '../../../core/mensagens/mensagem.model';
import { MensagemService } from '../../../core/mensagens/mensagem.service';
import { PacienteService } from '../../../core/pacientes/paciente.service';
import { avatarTint } from '../../../core/ui/avatar-color';
import { Icon } from '../../../core/ui/icon/icon';
import { Skeleton } from '../../../core/ui/skeleton/skeleton';

@Component({
  selector: 'app-mensagem-thread',
  imports: [RouterLink, DatePipe, ReactiveFormsModule, Icon, Skeleton],
  templateUrl: './mensagem-thread.html',
  styleUrl: './mensagem-thread.scss',
})
export class MensagemThread implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly mensagemService = inject(MensagemService);
  private readonly pacienteService = inject(PacienteService);

  protected readonly mensagens = signal<Mensagem[]>([]);
  protected readonly loading = signal(true);
  protected readonly sending = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly pacienteNome = signal('');
  protected readonly pacienteEmail = signal('');
  protected readonly avatarTint = avatarTint;

  protected readonly novaMensagemControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required],
  });

  private pacienteId!: number;

  ngOnInit(): void {
    this.pacienteId = Number(this.route.snapshot.paramMap.get('id'));

    this.pacienteService.buscarPorId(this.pacienteId).subscribe({
      next: (paciente) => {
        this.pacienteNome.set(paciente.nome);
        this.pacienteEmail.set(paciente.email);
      },
      error: () => this.errorMessage.set('Paciente não encontrado.'),
    });

    this.carregar();
  }

  protected enviar(event: Event): void {
    event.preventDefault();

    const conteudo = this.novaMensagemControl.value.trim();
    if (!conteudo) {
      return;
    }

    this.sending.set(true);
    this.errorMessage.set(null);

    this.mensagemService
      .enviar({ pacienteId: this.pacienteId, autor: 'PROFISSIONAL', conteudo })
      .subscribe({
        next: () => {
          this.novaMensagemControl.setValue('');
          this.sending.set(false);
          this.carregar();
        },
        error: () => {
          this.sending.set(false);
          this.errorMessage.set('Não foi possível enviar a mensagem.');
        },
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
    this.mensagemService.listarPorPaciente(this.pacienteId).subscribe({
      next: (mensagens) => {
        this.mensagens.set(mensagens);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Não foi possível carregar as mensagens.');
        this.loading.set(false);
      },
    });
  }
}
