import { UISref, useIsActive } from '@uirouter/react';
import classNames from 'classnames';
import { FC, ReactNode } from 'react';
import SVG from 'react-inlinesvg';

interface MenuItemProps {
  title: ReactNode;
  badge?: ReactNode;
  state?: string;
  activeState?: string;
  child?: boolean;
  params?;
  iconPath?: string;
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
          {props.iconPath && (
            <span className="menu-icon">
              <span className="svg-icon svg-icon-2">
                <SVG src={props.iconPath} />
              </span>
            </span>
          )}
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
          {props.badge && <span className="menu-badge">{props.badge}</span>}
        </a>
      </UISref>
    </div>
  );
};
