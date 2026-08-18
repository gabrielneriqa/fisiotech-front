import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Avaliacao } from '../../../core/avaliacoes/avaliacao.model';
import { Consulta } from '../../../core/consultas/consulta.model';
import { MeService } from '../../../core/me/me.service';

@Component({
  selector: 'app-paciente-consulta-detail',
  imports: [RouterLink, ReactiveFormsModule, DatePipe, CurrencyPipe],
  templateUrl: './paciente-consulta-detail.html',
  styleUrl: './paciente-consulta-detail.scss',
})
export class PacienteConsultaDetail implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly meService = inject(MeService);

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

    this.meService.minhaConsulta(this.consultaId).subscribe({
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

  protected enviarAvaliacao(): void {
    if (this.avaliacaoForm.invalid) {
      this.avaliacaoForm.markAllAsTouched();
      return;
    }

    this.avaliacaoLoading.set(true);
    const { nota, comentario } = this.avaliacaoForm.getRawValue();

    this.meService.avaliar({ consultaId: this.consultaId, nota, comentario: comentario.trim() || null }).subscribe({
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

  private carregarAvaliacao(): void {
    this.meService.minhaAvaliacao(this.consultaId).subscribe({
      next: (avaliacao) => {
        this.avaliacao.set(avaliacao);
        this.avaliacaoBuscada.set(true);
      },
      error: () => this.avaliacaoBuscada.set(true),
    });
  }
}
