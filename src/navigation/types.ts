import { ComponentType, ReactNode } from 'react';

export interface PageBarTab {
  key: string;
  title: ReactNode;
  component?: ComponentType<any>;
  children?: Omit<PageBarTab, 'children'>[];
}
