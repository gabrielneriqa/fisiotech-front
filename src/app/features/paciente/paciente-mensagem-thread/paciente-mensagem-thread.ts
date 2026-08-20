import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Mensagem } from '../../../core/mensagens/mensagem.model';
import { MeService } from '../../../core/me/me.service';
import { Skeleton } from '../../../core/ui/skeleton/skeleton';

@Component({
  selector: 'app-paciente-mensagem-thread',
  imports: [DatePipe, ReactiveFormsModule, RouterLink, Skeleton],
  templateUrl: './paciente-mensagem-thread.html',
  styleUrl: './paciente-mensagem-thread.scss',
})
export class PacienteMensagemThread implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly meService = inject(MeService);

  protected readonly mensagens = signal<Mensagem[]>([]);
  protected readonly loading = signal(true);
  protected readonly sending = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly profissionalNome = signal('');

  protected readonly novaMensagemControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required],
  });

  private profissionalId!: number;

  ngOnInit(): void {
    this.profissionalId = Number(this.route.snapshot.paramMap.get('profissionalId'));

    this.meService.buscarProfissional(this.profissionalId).subscribe({
      next: (profissional) => this.profissionalNome.set(profissional.nome),
      error: () => this.errorMessage.set('Profissional não encontrado.'),
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

    this.meService.enviarMensagem(this.profissionalId, conteudo).subscribe({
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

  private carregar(): void {
    this.meService.minhaConversa(this.profissionalId).subscribe({
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
