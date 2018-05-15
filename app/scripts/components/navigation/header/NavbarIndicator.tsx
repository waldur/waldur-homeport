import * as React from 'react';

import { Link } from '@waldur/core/Link';

interface CartIndicatorProps {
  count: number;
  iconClass: string;
  state: string;
}

export const NavbarIndicator = (props: CartIndicatorProps) => (
  <li style={{ marginRight: '0px' }}>
    <Link
      state={props.state}
      className="count-info position-relative"
      label={
        <>
          <i className={props.iconClass}/>
          {props.count && <span className="label label-primary">{props.count}</span>}
        </>
      }
    />
  </li>
);
