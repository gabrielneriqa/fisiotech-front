import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Avaliacao } from '../../../core/avaliacoes/avaliacao.model';
import { AvaliacaoService } from '../../../core/avaliacoes/avaliacao.service';
import { Consulta } from '../../../core/consultas/consulta.model';
import { ConsultaService } from '../../../core/consultas/consulta.service';

@Component({
  selector: 'app-consulta-detail',
  imports: [RouterLink, ReactiveFormsModule, DatePipe, CurrencyPipe],
  templateUrl: './consulta-detail.html',
  styleUrl: './consulta-detail.scss',
})
export class ConsultaDetail implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly consultaService = inject(ConsultaService);
  private readonly avaliacaoService = inject(AvaliacaoService);

  protected readonly consulta = signal<Consulta | null>(null);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly avaliacao = signal<Avaliacao | null>(null);
  protected readonly avaliacaoLoading = signal(false);
  protected readonly avaliacaoBuscada = signal(false);

  protected readonly avaliacaoForm = this.fb.nonNullable.group({
    nota: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
    comentario: [''],
  });

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

  protected enviarAvaliacao(): void {
    if (this.avaliacaoForm.invalid) {
      this.avaliacaoForm.markAllAsTouched();
      return;
    }

    this.avaliacaoLoading.set(true);
    const { nota, comentario } = this.avaliacaoForm.getRawValue();

    this.avaliacaoService
      .criar({ consultaId: this.consultaId, nota, comentario: comentario.trim() || null })
      .subscribe({
        next: () => {
          this.avaliacaoLoading.set(false);
          this.carregarAvaliacao();
        },
        error: () => {
          this.avaliacaoLoading.set(false);
          this.errorMessage.set('Não foi possível enviar a avaliação.');
        },
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
