import { useIsActive } from '@uirouter/react';
import classNames from 'classnames';
import { FC, ReactNode } from 'react';

import { Link } from '@waldur/core/Link';
import { Tip } from '@waldur/core/Tooltip';

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

export const MenuItem: FC<MenuItemProps> = (props) => {
  const { child = true, disabled = false, disabledTooltip } = props;
  const isActive = props.activeState
    ? useIsActive(props.activeState)
    : useIsActive(props.state, props.params);

  const content = (
    <>
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
    </>
  );

  const menuItem = (
    <div
      data-kt-menu-trigger="click"
      className={classNames('menu-item', {
        here: isActive,
        'menu-item-disabled': disabled,
      })}
    >
      {disabled ? (
        <span className="menu-link">{content}</span>
      ) : (
        <Link
          state={props.state}
          params={props.params}
          className="menu-link"
          data-testid={props.state}
        >
          {content}
        </Link>
      )}
    </div>
  );

  if (disabled && disabledTooltip) {
    return (
      <Tip label={disabledTooltip} id={`menu-item-${props.state}`}>
        {menuItem}
      </Tip>
    );
  }

  return menuItem;
};
