import type { ComponentType } from 'react';

export interface ResourceTab {
  key: string;
  title: string;
  component: ComponentType<{ resource: any }>;
  feature?: string;
  isVisible?(resource): boolean;
}
