import { ComponentType, ReactNode } from 'react';

export interface PageBarTab<T = any> {
  key: string;
  title: ReactNode;
  component?: ComponentType<T>;
  /** The default key that will be activated when the parent is clicked. It can be the key of one of the children. */
  defaultKey?: string;
  disabled?: boolean;
  /** Explains why the tab is disabled. Shown as a tooltip on the tab. */
  disabledReason?: ReactNode;
  visible?: boolean;
  children?: Omit<PageBarTab<T>, 'children' | 'defaultKey'>[];
}
