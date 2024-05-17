import { ComponentType, ReactNode } from 'react';

export interface PageBarTab {
  key: string;
  title: ReactNode;
  component: ComponentType;
  children?: Omit<PageBarTab, 'children'>[];
}
