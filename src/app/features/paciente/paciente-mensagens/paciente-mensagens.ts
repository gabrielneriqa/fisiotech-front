import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MinhaConversaItem } from '../../../core/mensagens/mensagem.model';
import { MeService } from '../../../core/me/me.service';
import { Skeleton } from '../../../core/ui/skeleton/skeleton';

@Component({
  selector: 'app-paciente-mensagens',
  imports: [RouterLink, DatePipe, Skeleton],
  templateUrl: './paciente-mensagens.html',
  styleUrl: './paciente-mensagens.scss',
})
export class PacienteMensagens implements OnInit {
  private readonly meService = inject(MeService);

  protected readonly conversas = signal<MinhaConversaItem[]>([]);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.meService.minhasConversas().subscribe({
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

  protected iniciais(nome: string): string {
    return nome
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((parte) => parte[0]?.toUpperCase() ?? '')
      .join('');
  }
}
