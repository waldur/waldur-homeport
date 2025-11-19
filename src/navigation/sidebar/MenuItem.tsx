import { useIsActive } from '@uirouter/react';
import classNames from 'classnames';
import { FC, ReactNode } from 'react';

import { Link } from '@waldur/core/Link';

interface MenuItemProps {
  title: ReactNode;
  badge?: ReactNode;
  state?: string;
  activeState?: string;
  child?: boolean;
  params?;
  icon?: ReactNode;
}

export const MenuItem: FC<MenuItemProps> = (props) => {
  const { child = true } = props;
  const isActive = props.activeState
    ? useIsActive(props.activeState)
    : useIsActive(props.state, props.params);
  return (
    <div
      data-kt-menu-trigger="click"
      className={classNames('menu-item', { here: isActive })}
    >
      <Link state={props.state} params={props.params} className="menu-link">
        {props.icon && (
          <span className="menu-icon">
            <span className="svg-icon svg-icon-2">{props.icon}</span>
          </span>
        )}
        {child && (
          <span className="menu-bullet">
            <span className="bullet bullet-dot" />
          </span>
        )}
        <span className="menu-title">{props.title}</span>
        {Boolean(props.badge) && (
          <span className="menu-badge">
            <span className="badge badge-pill">{props.badge}</span>
          </span>
        )}
      </Link>
    </div>
  );
};
