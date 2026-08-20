import { Component, computed, input } from '@angular/core';

export type SkeletonVariant = 'list' | 'form' | 'thread' | 'lines';

/**
 * Placeholder animado usado no lugar do texto "Carregando..." nas telas que
 * esperam dados. O formato (variant) aproxima a silhueta do conteúdo real
 * para reduzir a sensação de tela travada, especialmente em conexões lentas.
 */
@Component({
  selector: 'app-skeleton',
  templateUrl: './skeleton.html',
  styleUrl: './skeleton.scss',
})
export class Skeleton {
  readonly variant = input<SkeletonVariant>('lines');
  readonly count = input(3);

  protected readonly items = computed(() => Array.from({ length: this.count() }, (_, i) => i));
}
