import { ComponentType } from 'react';

import { trackedLazy } from '@/navigation/pageLoading';

import { MarketplaceLayoutProps } from './types';

export type MarketplaceLayoutType = 'classic' | 'sidebar' | 'carousel';

export const LAYOUTS: Record<
  MarketplaceLayoutType,
  ComponentType<MarketplaceLayoutProps>
> = {
  classic: trackedLazy(() =>
    import('./ClassicLayout').then((m) => ({ default: m.ClassicLayout })),
  ),
  sidebar: trackedLazy(() =>
    import('./SidebarLayout').then((m) => ({ default: m.SidebarLayout })),
  ),
  carousel: trackedLazy(() =>
    import('./CarouselLayout').then((m) => ({ default: m.CarouselLayout })),
  ),
};
