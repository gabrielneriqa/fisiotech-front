import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { TipoConsulta } from '../../../core/consultas/consulta.model';
import { DisponibilidadeResponse, ProfissionalBusca, SlotDisponibilidade } from '../../../core/consultas/consulta-booking.model';
import { MeService } from '../../../core/me/me.service';
import { Icon } from '../../../core/ui/icon/icon';

type Etapa = 'profissional' | 'agendamento';
type FormaPagamento = 'particular' | 'convenio';

interface DiaStrip {
  iso: string;
  dow: string;
  dia: number;
}

function paraIsoLocal(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

@Component({
  selector: 'app-consulta-booking',
  imports: [FormsModule, RouterLink, DatePipe, CurrencyPipe, Icon],
  templateUrl: './consulta-booking.html',
  styleUrl: './consulta-booking.scss',
})
export class ConsultaBooking {
  private readonly meService = inject(MeService);
  private readonly router = inject(Router);

  protected readonly etapa = signal<Etapa>('profissional');

  protected readonly buscaNome = signal('');
  protected readonly buscaEspecialidade = signal('');
  protected readonly profissionais = signal<ProfissionalBusca[]>([]);
  protected readonly buscandoProfissionais = signal(false);
  protected readonly profissionalSelecionado = signal<ProfissionalBusca | null>(null);

  protected readonly hoje = paraIsoLocal(new Date());
  protected readonly dataSelecionada = signal(this.hoje);
  protected readonly disponibilidade = signal<DisponibilidadeResponse | null>(null);
  protected readonly carregandoDisponibilidade = signal(false);
  protected readonly horarioSelecionado = signal<string | null>(null);

  protected readonly tipo = signal<TipoConsulta>('PRESENCIAL');
  protected readonly formaPagamento = signal<FormaPagamento>('particular');
  protected readonly convenioSelecionado = signal<string | null>(null);

  protected readonly mostrarConfirmacao = signal(false);
  protected readonly saving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly valorParticular = computed(() => this.profissionalSelecionado()?.valorConsultaParticular ?? null);
  protected readonly conveniosDisponiveis = computed(() => this.profissionalSelecionado()?.conveniosAceitos ?? []);

  protected readonly diasStrip = computed<DiaStrip[]>(() => {
    const dias: DiaStrip[] = [];
    for (let i = 0; i < 7; i++) {
      const data = new Date();
      data.setDate(data.getDate() + i);
      dias.push({
        iso: paraIsoLocal(data),
        dow: data.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').toUpperCase(),
        dia: data.getDate(),
      });
    }
    return dias;
  });

  constructor() {
    this.buscarProfissionais();
  }

  protected buscarProfissionais(): void {
    this.buscandoProfissionais.set(true);
    this.meService.buscarProfissionais(this.buscaNome() || undefined, this.buscaEspecialidade() || undefined).subscribe({
      next: (profissionais) => {
        this.profissionais.set(profissionais);
        this.buscandoProfissionais.set(false);
      },
      error: () => {
        this.profissionais.set([]);
        this.buscandoProfissionais.set(false);
      },
    });
  }

  protected selecionarProfissional(profissional: ProfissionalBusca): void {
    this.profissionalSelecionado.set(profissional);
    this.formaPagamento.set('particular');
    this.convenioSelecionado.set(null);
    this.dataSelecionada.set(this.hoje);
    this.etapa.set('agendamento');
    this.carregarDisponibilidade();
  }

  protected selecionarDia(iso: string): void {
    this.dataSelecionada.set(iso);
    this.horarioSelecionado.set(null);
    this.carregarDisponibilidade();
  }

  private carregarDisponibilidade(): void {
    const profissional = this.profissionalSelecionado();
    if (!profissional) {
      return;
    }

    this.carregandoDisponibilidade.set(true);
    this.meService.buscarDisponibilidade(profissional.id, this.dataSelecionada()).subscribe({
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
    this.horarioSelecionado.set(slot.horario);
  }

  protected selecionarFormaPagamento(forma: FormaPagamento): void {
    this.formaPagamento.set(forma);
    if (forma === 'particular') {
      this.convenioSelecionado.set(null);
    }
  }

  protected abrirConfirmacao(): void {
    this.errorMessage.set(null);
    this.mostrarConfirmacao.set(true);
  }

  protected fecharConfirmacao(): void {
    this.mostrarConfirmacao.set(false);
  }

  protected confirmar(): void {
    const profissional = this.profissionalSelecionado();
    const horario = this.horarioSelecionado();
    if (!profissional || !horario) {
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);

    const dataHora = `${this.dataSelecionada()}T${horario.slice(0, 5)}:00`;
    const convenio = this.formaPagamento() === 'convenio' ? this.convenioSelecionado() : null;

    this.meService
      .marcarConsulta({
        profissionalId: profissional.id,
        dataHora,
        tipo: this.tipo(),
        convenio,
      })
      .subscribe({
        next: (consulta) => {
          this.saving.set(false);
          this.mostrarConfirmacao.set(false);
          this.router.navigate(['/paciente/consultas', consulta.id]);
        },
        error: (err: { status?: number }) => {
          this.saving.set(false);
          this.mostrarConfirmacao.set(false);
          if (err.status === 409) {
            this.errorMessage.set('Este horário não está mais disponível. Escolha outro.');
            this.horarioSelecionado.set(null);
            this.carregarDisponibilidade();
          } else {
            this.errorMessage.set('Não foi possível marcar a consulta. Tente novamente.');
          }
        },
      });
  }
}
