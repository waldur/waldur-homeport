import { ComponentType, ReactNode } from 'react';

import type { TabCountProps } from 'waldur-ui';

/** `count`, `countVariant` and `countLabel` draw a count after the title. */
export interface PageBarTab<T = any> extends TabCountProps {
  key: string;
  title: ReactNode;
  component?: ComponentType<T>;
  /** The default key that will be activated when the parent is clicked. It can be the key of one of the children. */
  defaultKey?: string;
  disabled?: boolean;
  /** Explains why the tab is disabled. Shown as a tooltip on the tab. */
  disabledReason?: ReactNode;
  visible?: boolean;
  /**
   * Params the tab's link sets besides `tab`. The link keeps the page's
   * other params, so a tab that leaves a param of another tab behind sets it
   * to `null` here.
   */
  linkParams?: Record<string, unknown>;
  children?: Omit<PageBarTab<T>, 'children' | 'defaultKey'>[];
}
