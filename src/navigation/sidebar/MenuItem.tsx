import { UISref, useIsActive } from '@uirouter/react';
import classNames from 'classnames';
import React from 'react';
import SVG from 'react-inlinesvg';

export const MenuItem: React.FC<{
  title: React.ReactNode;
  badge?: React.ReactNode;
  state?: string;
  activeState?: string;
  child?: boolean;
  params?;
  iconPath?: string;
}> = (props) => {
  const isActive = props.activeState
    ? useIsActive(props.activeState)
    : useIsActive(props.state, props.params);
  return (
    <div
      data-kt-menu-trigger="click"
      className={classNames('menu-item', { here: isActive })}
    >
      <UISref to={props.state} params={props.params}>
        <span className="menu-link">
          {props.iconPath && (
            <span className="menu-icon">
              <span className="svg-icon svg-icon-2">
                <SVG src={props.iconPath} />
              </span>
            </span>
          )}
          {props.child && (
            <span className="menu-bullet">
              <span className="bullet bullet-dot"></span>
            </span>
          )}
          <span className="menu-title">{props.title}</span>
          {props.badge && <span className="menu-badge">{props.badge}</span>}
        </span>
      </UISref>
    </div>
  );
};

MenuItem.defaultProps = {
  child: true,
};
