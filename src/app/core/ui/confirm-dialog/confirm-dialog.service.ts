import { Injectable, signal } from '@angular/core';

export interface ConfirmOptions {
  titulo: string;
  mensagem: string;
  confirmarLabel?: string;
  cancelarLabel?: string;
  /** Estiliza o botão de confirmar como ação destrutiva (vermelho). Padrão: true. */
  destrutivo?: boolean;
}

interface ConfirmState {
  options: ConfirmOptions;
  resolve: (confirmado: boolean) => void;
}

/**
 * Substitui o confirm() nativo do navegador por um diálogo próprio, consistente
 * com a identidade visual do app (e utilizável dentro do WebView do Capacitor).
 */
@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private readonly state = signal<ConfirmState | null>(null);
  readonly current = this.state.asReadonly();

  confirm(options: ConfirmOptions): Promise<boolean> {
    return new Promise((resolve) => {
      this.state.set({ options, resolve });
    });
  }

  responder(confirmado: boolean): void {
    this.state()?.resolve(confirmado);
    this.state.set(null);
  }
}
