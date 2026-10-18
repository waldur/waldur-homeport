import { ComponentType } from 'react';

import { trackedLazy } from '@/navigation/pageLoading';

import type { CardStyleType, OfferingCardVariantProps } from './types';

export type { CardStyleType } from './types';

export const CARD_STYLES: Record<
  CardStyleType,
  ComponentType<OfferingCardVariantProps>
> = {
  compact: trackedLazy(() =>
    import('./CompactCard').then((m) => ({ default: m.CompactCard })),
  ),
  detailed: trackedLazy(() =>
    import('./DetailedCard').then((m) => ({ default: m.DetailedCard })),
  ),
  list: trackedLazy(() =>
    import('./ListItemCard').then((m) => ({ default: m.ListItemCard })),
  ),
  minimal: trackedLazy(() =>
    import('./ImageCard').then((m) => ({ default: m.ImageCard })),
  ),
};

export const DEFAULT_CARD_STYLE: CardStyleType = 'detailed';
