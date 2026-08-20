import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Consulta, StatusConsulta, TipoConsulta } from '../../../core/consultas/consulta.model';
import { ConsultaService } from '../../../core/consultas/consulta.service';
import { Icon } from '../../../core/ui/icon/icon';
import { Skeleton } from '../../../core/ui/skeleton/skeleton';

type WizardStep = 'quadro-clinico' | 'habitos-vida' | 'exame-fisico' | 'diagnostico' | 'sucesso';

const ORDEM_PASSOS: WizardStep[] = ['quadro-clinico', 'habitos-vida', 'exame-fisico', 'diagnostico', 'sucesso'];

@Component({
  selector: 'app-consulta-wizard',
  imports: [ReactiveFormsModule, RouterLink, Icon, Skeleton],
  templateUrl: './consulta-wizard.html',
  styleUrl: './consulta-wizard.scss',
})
export class ConsultaWizard implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly consultaService = inject(ConsultaService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly step = signal<WizardStep>('quadro-clinico');
  protected readonly pacienteNome = signal('');

  protected readonly quadroClinicoForm = this.fb.nonNullable.group({
    queixaPrincipal: [''],
    historiaDoencaAtual: [''],
    historicoSaude: [''],
    cirurgias: [false],
    cirurgiasDescricao: [''],
    lesoesAnteriores: [false],
    lesoesAnterioresDescricao: [''],
    medicamentos: [''],
  });

  protected readonly habitosVidaForm = this.fb.nonNullable.group({
    atividadeFisica: [''],
    rotinaTrabalho: [''],
    tabagismo: [false],
    consumoAlcool: [false],
  });

  protected readonly exameFisicoForm = this.fb.nonNullable.group({
    postura: [''],
    amplitudeMovimento: [''],
    palpacao: [''],
    forcaMuscular: [''],
  });

  protected readonly diagnosticoForm = this.fb.nonNullable.group({
    planoTratamento: [''],
    objetivosTratamento: [''],
  });

  protected readonly opcoesHistoricoSaude = ['Hipertensão', 'Diabetes', 'Asma'];
  protected readonly outrasAtivo = signal(false);

  protected chipHistoricoSaudeAtivo(opcao: string): boolean {
    return this.termosHistoricoSaude().includes(opcao);
  }

  protected toggleChipHistoricoSaude(opcao: string): void {
    const termos = this.termosHistoricoSaude();
    const idx = termos.indexOf(opcao);
    if (idx >= 0) {
      termos.splice(idx, 1);
    } else {
      termos.push(opcao);
    }
    this.quadroClinicoForm.controls.historicoSaude.setValue(termos.join(', '));
  }

  protected toggleOutras(): void {
    this.outrasAtivo.update((v) => !v);
  }

  protected onOutrasChange(event: Event): void {
    const valor = (event.target as HTMLInputElement).value.trim();
    const termosFixos = this.termosHistoricoSaude().filter((t) => this.opcoesHistoricoSaude.includes(t));
    const partes = valor ? [...termosFixos, valor] : termosFixos;
    this.quadroClinicoForm.controls.historicoSaude.setValue(partes.join(', '));
  }

  private termosHistoricoSaude(): string[] {
    return this.quadroClinicoForm.controls.historicoSaude.value
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
  }

  protected consultaId!: number;
  private base!: { dataHora: string; tipo: TipoConsulta; status: StatusConsulta; convenio: string | null; valor: number | null };

  ngOnInit(): void {
    this.consultaId = Number(this.route.snapshot.paramMap.get('id'));

    this.consultaService.buscarPorId(this.consultaId).subscribe({
      next: (consulta) => this.preencherFormularios(consulta),
      error: () => {
        this.errorMessage.set('Não foi possível carregar a consulta.');
        this.loading.set(false);
      },
    });
  }

  protected proximo(): void {
    const etapaAtual = this.step();
    this.saving.set(true);
    this.errorMessage.set(null);

    const finalizando = etapaAtual === 'diagnostico';

    this.consultaService
      .atualizar(this.consultaId, {
        ...this.base,
        status: finalizando ? 'REALIZADA' : this.base.status,
        quadroClinico: etapaAtual === 'quadro-clinico' ? this.quadroClinicoForm.getRawValue() : undefined,
        habitosVida: etapaAtual === 'habitos-vida' ? this.habitosVidaForm.getRawValue() : undefined,
        exameFisico: etapaAtual === 'exame-fisico' ? this.exameFisicoForm.getRawValue() : undefined,
        diagnostico: finalizando ? this.diagnosticoForm.getRawValue() : undefined,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          if (finalizando) {
            this.base.status = 'REALIZADA';
          }
          this.step.set(ORDEM_PASSOS[ORDEM_PASSOS.indexOf(etapaAtual) + 1]);
        },
        error: () => {
          this.saving.set(false);
          this.errorMessage.set('Não foi possível salvar. Tente novamente.');
        },
      });
  }

  private preencherFormularios(consulta: Consulta): void {
    this.pacienteNome.set(consulta.pacienteNome);
    this.base = {
      dataHora: consulta.dataHora,
      tipo: consulta.tipo,
      status: consulta.status,
      convenio: consulta.convenio,
      valor: consulta.valor,
    };
    this.quadroClinicoForm.patchValue({
      queixaPrincipal: consulta.quadroClinico.queixaPrincipal ?? '',
      historiaDoencaAtual: consulta.quadroClinico.historiaDoencaAtual ?? '',
      historicoSaude: consulta.quadroClinico.historicoSaude ?? '',
      cirurgias: consulta.quadroClinico.cirurgias ?? false,
      cirurgiasDescricao: consulta.quadroClinico.cirurgiasDescricao ?? '',
      lesoesAnteriores: consulta.quadroClinico.lesoesAnteriores ?? false,
      lesoesAnterioresDescricao: consulta.quadroClinico.lesoesAnterioresDescricao ?? '',
      medicamentos: consulta.quadroClinico.medicamentos ?? '',
    });
    this.habitosVidaForm.patchValue({
      atividadeFisica: consulta.habitosVida.atividadeFisica ?? '',
      rotinaTrabalho: consulta.habitosVida.rotinaTrabalho ?? '',
      tabagismo: consulta.habitosVida.tabagismo ?? false,
      consumoAlcool: consulta.habitosVida.consumoAlcool ?? false,
    });
    this.exameFisicoForm.patchValue({
      postura: consulta.exameFisico.postura ?? '',
      amplitudeMovimento: consulta.exameFisico.amplitudeMovimento ?? '',
      palpacao: consulta.exameFisico.palpacao ?? '',
      forcaMuscular: consulta.exameFisico.forcaMuscular ?? '',
    });
    this.diagnosticoForm.patchValue({
      planoTratamento: consulta.diagnostico.planoTratamento ?? '',
      objetivosTratamento: consulta.diagnostico.objetivosTratamento ?? '',
    });
    this.loading.set(false);
  }
}
