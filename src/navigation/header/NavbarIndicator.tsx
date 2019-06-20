import * as React from 'react';

import { Link } from '@waldur/core/Link';

import './NavbarIndicator.scss';

interface NavbarIndicatorProps {
  count: number;
  iconClass: string;
  labelClass?: string;
  state: string;
  params?: Record<string, string>;
}

export const NavbarIndicator: React.SFC<NavbarIndicatorProps> = (props: NavbarIndicatorProps) => (
  <li className="navbar-indicator">
    <Link state={props.state} params={props.params}>
      <i className={props.iconClass}/>
      {props.count > 0 && (
        <span className={props.labelClass}>{props.count}</span>
      )}
    </Link>
  </li>
);

NavbarIndicator.defaultProps = {
  labelClass: 'label label-primary',
};
