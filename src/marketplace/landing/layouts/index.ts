import { ComponentType, lazy } from 'react';

import { MarketplaceLayoutProps } from './types';

export type MarketplaceLayoutType = 'classic' | 'sidebar' | 'carousel';

export const LAYOUTS: Record<
  MarketplaceLayoutType,
  ComponentType<MarketplaceLayoutProps>
> = {
  classic: lazy(() =>
    import('./ClassicLayout').then((m) => ({ default: m.ClassicLayout })),
  ),
  sidebar: lazy(() =>
    import('./SidebarLayout').then((m) => ({ default: m.SidebarLayout })),
  ),
  carousel: lazy(() =>
    import('./CarouselLayout').then((m) => ({ default: m.CarouselLayout })),
  ),
};
