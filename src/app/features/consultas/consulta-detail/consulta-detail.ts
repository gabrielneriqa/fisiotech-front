import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Avaliacao } from '../../../core/avaliacoes/avaliacao.model';
import { AvaliacaoService } from '../../../core/avaliacoes/avaliacao.service';
import { Consulta } from '../../../core/consultas/consulta.model';
import { ConsultaService } from '../../../core/consultas/consulta.service';

@Component({
  selector: 'app-consulta-detail',
  imports: [RouterLink, DatePipe, CurrencyPipe],
  templateUrl: './consulta-detail.html',
  styleUrl: './consulta-detail.scss',
})
export class ConsultaDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly consultaService = inject(ConsultaService);
  private readonly avaliacaoService = inject(AvaliacaoService);

  protected readonly consulta = signal<Consulta | null>(null);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly avaliacao = signal<Avaliacao | null>(null);
  protected readonly avaliacaoBuscada = signal(false);

  private consultaId!: number;

  ngOnInit(): void {
    this.consultaId = Number(this.route.snapshot.paramMap.get('id'));
    this.carregar();
  }

  protected excluir(): void {
    if (!confirm('Excluir esta consulta? Essa ação não pode ser desfeita.')) {
      return;
    }

    this.consultaService.deletar(this.consultaId).subscribe({
      next: () => this.router.navigateByUrl('/consultas'),
      error: () => this.errorMessage.set('Não foi possível excluir a consulta.'),
    });
  }

  private carregar(): void {
    this.loading.set(true);
    this.consultaService.buscarPorId(this.consultaId).subscribe({
      next: (consulta) => {
        this.consulta.set(consulta);
        this.loading.set(false);
        if (consulta.status === 'REALIZADA') {
          this.carregarAvaliacao();
        }
      },
      error: () => {
        this.errorMessage.set('Não foi possível carregar a consulta.');
        this.loading.set(false);
      },
    });
  }

  private carregarAvaliacao(): void {
    this.avaliacaoService.buscarPorConsulta(this.consultaId).subscribe({
      next: (avaliacao) => {
        this.avaliacao.set(avaliacao);
        this.avaliacaoBuscada.set(true);
      },
      error: () => this.avaliacaoBuscada.set(true),
    });
  }
}
