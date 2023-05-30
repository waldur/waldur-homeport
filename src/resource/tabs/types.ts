import type { ComponentType } from 'react';

export interface ResourceTab {
  key: string;
  title: string;
  component: ComponentType<{ resource: any }>;
  feature?: string;
  isVisible?(resource): boolean;
}

export interface MenuItemType {
  key: string;
  title: string;
  component: ComponentType<any>;
  icon?: string;
  visible?: boolean;
}
