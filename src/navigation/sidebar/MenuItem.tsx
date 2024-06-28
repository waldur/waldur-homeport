import { UISref, useIsActive } from '@uirouter/react';
import classNames from 'classnames';
import { FC, ReactNode } from 'react';
import { Badge } from 'react-bootstrap';

import { ENV } from '@waldur/configs/default';

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
      <UISref to={props.state} params={props.params}>
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        <a className="menu-link">
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
          {props.badge && (
            <span className="menu-badge">
              {ENV.plugins.WALDUR_CORE.SIDEBAR_STYLE === 'light' ? (
                <Badge bg="" className="badge-outline badge-outline-default">
                  {props.badge}
                </Badge>
              ) : (
                <Badge bg="primary">{props.badge}</Badge>
              )}
            </span>
          )}
        </a>
      </UISref>
    </div>
  );
};
