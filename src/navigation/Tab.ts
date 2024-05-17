import { ReactNode } from 'react';

export interface Tab {
  title: ReactNode;
  to?: string;
  params?: Record<string, any>;
  children?: Tab[];
}
