import { UISref, UISrefActive } from '@uirouter/react';
import React from 'react';

export const MenuItem: React.FC<{
  title: React.ReactNode;
  badge?: React.ReactNode;
  state?: string;
  child?: boolean;
  params?;
}> = (props) => (
  <UISrefActive class="here">
    <div data-kt-menu-trigger="click" className="menu-item">
      <UISref to={props.state} params={props.params}>
        <span className="menu-link">
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
  </UISrefActive>
);

MenuItem.defaultProps = {
  child: true,
};
