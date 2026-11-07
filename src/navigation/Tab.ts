import { ReactNode } from 'react';

import type { TabCountProps } from 'waldur-ui';

export interface Tab extends TabCountProps {
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
