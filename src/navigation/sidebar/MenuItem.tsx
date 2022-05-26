import { UISref, UISrefActive } from '@uirouter/react';
import React from 'react';

export const MenuItem: React.FC<{
  title: React.ReactNode;
  state?: string;
  params?;
}> = (props) => (
  <UISrefActive class="here">
    <div data-kt-menu-trigger="click" className="menu-item">
      <UISref to={props.state} params={props.params}>
        <span className="menu-link">
          <span className="menu-title">{props.title}</span>
        </span>
      </UISref>
    </div>
  </UISrefActive>
);
