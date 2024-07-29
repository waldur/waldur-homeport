import { ComponentType, ReactNode } from 'react';

export interface PageBarTab {
  key: string;
  title: ReactNode;
  component?: ComponentType<any>;
  children?: Omit<PageBarTab, 'children'>[];
}

export interface IBreadcrumbItem {
  key: string;
  text: string;
  dropdown?: ReactNode | ((close: () => void) => ReactNode);
  hideDropdownArrow?: boolean;
  active?: boolean;
  to?: string;
  params?: object;
  ellipsis?: 'md' | 'xl' | 'xxl';
  truncate?: boolean;
  maxLength?: number;
}
