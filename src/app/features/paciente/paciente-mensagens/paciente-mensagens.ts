import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { Mensagem } from '../../../core/mensagens/mensagem.model';
import { MeService } from '../../../core/me/me.service';

@Component({
  selector: 'app-paciente-mensagens',
  imports: [DatePipe, ReactiveFormsModule],
  templateUrl: './paciente-mensagens.html',
  styleUrl: './paciente-mensagens.scss',
})
export class PacienteMensagens implements OnInit {
  private readonly meService = inject(MeService);

  protected readonly mensagens = signal<Mensagem[]>([]);
  protected readonly loading = signal(true);
  protected readonly sending = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly novaMensagemControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required],
  });

  ngOnInit(): void {
    this.carregar();
  }

  protected enviar(): void {
    const conteudo = this.novaMensagemControl.value.trim();
    if (!conteudo) {
      return;
    }

    this.sending.set(true);
    this.errorMessage.set(null);

    this.meService.enviarMensagem(conteudo).subscribe({
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
    this.meService.minhasMensagens().subscribe({
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
