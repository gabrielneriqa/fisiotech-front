import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Avaliacao } from '../../../core/avaliacoes/avaliacao.model';
import { Consulta } from '../../../core/consultas/consulta.model';
import { DisponibilidadeResponse, SlotDisponibilidade } from '../../../core/consultas/consulta-booking.model';
import { MeService } from '../../../core/me/me.service';
import { ConfirmDialogService } from '../../../core/ui/confirm-dialog/confirm-dialog.service';
import { Skeleton } from '../../../core/ui/skeleton/skeleton';

@Component({
  selector: 'app-paciente-consulta-detail',
  imports: [RouterLink, ReactiveFormsModule, FormsModule, DatePipe, CurrencyPipe, Skeleton],
  templateUrl: './paciente-consulta-detail.html',
  styleUrl: './paciente-consulta-detail.scss',
})
export class PacienteConsultaDetail implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly meService = inject(MeService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  protected readonly consulta = signal<Consulta | null>(null);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly avaliacao = signal<Avaliacao | null>(null);
  protected readonly avaliacaoLoading = signal(false);
  protected readonly avaliacaoBuscada = signal(false);

  protected readonly cancelando = signal(false);
  protected readonly remarcando = signal(false);
  protected readonly hoje = new Date().toISOString().slice(0, 10);
  protected readonly dataSelecionada = signal(this.hoje);
  protected readonly disponibilidade = signal<DisponibilidadeResponse | null>(null);
  protected readonly carregandoDisponibilidade = signal(false);
  protected readonly remarcarSaving = signal(false);

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

  protected async cancelar(): Promise<void> {
    const confirmado = await this.confirmDialog.confirm({
      titulo: 'Cancelar consulta',
      mensagem: 'Cancelar esta consulta? Essa ação não pode ser desfeita.',
      cancelarLabel: 'Voltar',
      confirmarLabel: 'Cancelar consulta',
    });
    if (!confirmado) {
      return;
    }

    this.cancelando.set(true);
    this.errorMessage.set(null);

    this.meService.cancelarConsulta(this.consultaId).subscribe({
      next: () => {
        this.cancelando.set(false);
        this.meService.minhaConsulta(this.consultaId).subscribe((consulta) => this.consulta.set(consulta));
      },
      error: () => {
        this.cancelando.set(false);
        this.errorMessage.set('Não foi possível cancelar a consulta.');
      },
    });
  }

  protected abrirRemarcar(): void {
    this.remarcando.set(true);
    this.dataSelecionada.set(this.hoje);
    this.carregarDisponibilidade();
  }

  protected fecharRemarcar(): void {
    this.remarcando.set(false);
    this.disponibilidade.set(null);
  }

  protected onDataChange(data: string): void {
    this.dataSelecionada.set(data);
    this.carregarDisponibilidade();
  }

  private carregarDisponibilidade(): void {
    const c = this.consulta();
    if (!c) {
      return;
    }

    this.carregandoDisponibilidade.set(true);
    this.meService.buscarDisponibilidade(c.profissionalId, this.dataSelecionada()).subscribe({
      next: (resposta) => {
        this.disponibilidade.set(resposta);
        this.carregandoDisponibilidade.set(false);
      },
      error: () => {
        this.disponibilidade.set(null);
        this.carregandoDisponibilidade.set(false);
      },
    });
  }

  protected selecionarHorario(slot: SlotDisponibilidade): void {
    if (!slot.disponivel) {
      return;
    }

    this.remarcarSaving.set(true);
    this.errorMessage.set(null);

    const novaDataHora = `${this.dataSelecionada()}T${slot.horario.slice(0, 5)}:00`;

    this.meService.remarcarConsulta(this.consultaId, novaDataHora).subscribe({
      next: (consulta) => {
        this.remarcarSaving.set(false);
        this.consulta.set(consulta);
        this.fecharRemarcar();
      },
      error: (err: { status?: number }) => {
        this.remarcarSaving.set(false);
        this.errorMessage.set(
          err.status === 409 ? 'Este horário não está mais disponível. Escolha outro.' : 'Não foi possível remarcar a consulta.',
        );
        this.carregarDisponibilidade();
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
