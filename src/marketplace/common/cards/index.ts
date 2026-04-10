import { ComponentType, lazy } from 'react';

import type { CardStyleType, OfferingCardVariantProps } from './types';

export type { CardStyleType } from './types';

export const CARD_STYLES: Record<
  CardStyleType,
  ComponentType<OfferingCardVariantProps>
> = {
  compact: lazy(() =>
    import('./CompactCard').then((m) => ({ default: m.CompactCard })),
  ),
  detailed: lazy(() =>
    import('./DetailedCard').then((m) => ({ default: m.DetailedCard })),
  ),
  list: lazy(() =>
    import('./ListItemCard').then((m) => ({ default: m.ListItemCard })),
  ),
  minimal: lazy(() =>
    import('./ImageCard').then((m) => ({ default: m.ImageCard })),
  ),
};

export const DEFAULT_CARD_STYLE: CardStyleType = 'detailed';
