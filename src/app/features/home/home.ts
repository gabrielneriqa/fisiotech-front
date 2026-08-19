import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Icon } from '../../core/ui/icon/icon';
import { CaixaEntradaItem } from '../../core/mensagens/mensagem.model';
import { MensagemService } from '../../core/mensagens/mensagem.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink, Icon],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private readonly mensagemService = inject(MensagemService);

  protected readonly notificacoes = signal<CaixaEntradaItem[]>([]);
  protected readonly loadingNotificacoes = signal(true);

  ngOnInit(): void {
    this.mensagemService.caixaEntrada().subscribe({
      next: (conversas) => {
        this.notificacoes.set(conversas);
        this.loadingNotificacoes.set(false);
      },
      error: () => this.loadingNotificacoes.set(false),
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
}
