import { ComponentType, ReactNode } from 'react';

export interface PageBarTab<T = any> {
  key: string;
  title: ReactNode;
  component?: ComponentType<T>;
  /** The default key that will be activated when the parent is clicked. It can be the key of one of the children. */
  defaultKey?: string;
  disabled?: boolean;
  visible?: boolean;
  children?: Omit<PageBarTab<T>, 'children' | 'defaultKey'>[];
}

export interface IBreadcrumbItem {
  key: string;
  text: string;
  dropdown?: ReactNode | ((close: () => void) => ReactNode);
  hideDropdownArrow?: boolean;
  active?: boolean;
  to?: string;
  params?: object;
  onClick?(): void;
  ellipsis?: 'md' | 'xl' | 'xxl';
  truncate?: boolean;
  maxLength?: number;
  tooltipText?: string;
}
