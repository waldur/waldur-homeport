import { useIsActive } from '@uirouter/react';
import { FC, ReactNode } from 'react';

import { SidebarMenuLinkItem } from 'waldur-ui';

import { Link } from '@/core/Link';
import { isStateVisible } from '@/core/stateVisibility';

interface MenuItemProps {
  title: ReactNode;
  badge?: ReactNode;
  state?: string;
  activeState?: string;
  child?: boolean;
  params?;
  icon?: ReactNode;
  disabled?: boolean;
  disabledTooltip?: string;
}

// Thin, uirouter-specific shell around waldur-ui's SidebarMenuLinkItem —
// that component owns the row's look (icon/spacer, active/hover state,
// disabled handling, badge, collapsed-rail tooltip); this file only
// supplies what's specific to this app's router: active-state resolution
// and the actual Link element.
export const MenuItem: FC<MenuItemProps> = ({
  title,
  badge,
  state,
  activeState,
  child,
  params,
  icon,
  disabled = false,
  disabledTooltip,
}) => {
  const isActive = activeState
    ? useIsActive(activeState)
    : useIsActive(state, params);

  // A menu entry pointing at a feature this deployment has disabled is dropped
  // entirely rather than left to fail on click.
  if (state && !isStateVisible(state)) {
    return null;
  }

  return (
    <SidebarMenuLinkItem
      title={title}
      icon={icon}
      badge={badge}
      child={child}
      active={isActive}
      disabled={disabled}
      disabledTooltip={disabledTooltip}
      renderLink={(content) => (
        <Link state={state} params={params} data-testid={state}>
          {content}
        </Link>
      )}
    />
  );
};
