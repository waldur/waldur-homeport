import { ReactNode } from 'react';

export interface Tab {
  title: ReactNode;
  to?: string;
  redirectTo?: { state; params? } | string;
  params?: Record<string, any>;
  disabled?: boolean;
  /** Explains why the tab is disabled. Shown as a tooltip on the tab. */
  disabledReason?: ReactNode;
  visible?: boolean;
  children?: Tab[];
}
