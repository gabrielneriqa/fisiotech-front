import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CaixaEntradaItem } from '../../../core/mensagens/mensagem.model';
import { MensagemService } from '../../../core/mensagens/mensagem.service';
import { Skeleton } from '../../../core/ui/skeleton/skeleton';

@Component({
  selector: 'app-caixa-entrada',
  imports: [RouterLink, DatePipe, Skeleton],
  templateUrl: './caixa-entrada.html',
  styleUrl: './caixa-entrada.scss',
})
export class CaixaEntrada implements OnInit {
  private readonly mensagemService = inject(MensagemService);

  protected readonly conversas = signal<CaixaEntradaItem[]>([]);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.carregar();
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
    this.loading.set(true);
    this.errorMessage.set(null);

    this.mensagemService.caixaEntrada().subscribe({
      next: (conversas) => {
        this.conversas.set(conversas);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Não foi possível carregar as mensagens.');
        this.loading.set(false);
      },
    });
  }
}
