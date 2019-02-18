import * as React from 'react';

import { $state } from './services';

interface LinkProps {
  label?: React.ReactNode;
  children?: React.ReactNode;
  state: string;
  params?: {[key: string]: string};
  className?: string;
  target?: string;
}

export const Link = (props: LinkProps) => (
  <a
    href={$state.href(props.state, props.params)}
    className={props.className}
    target={props.target}
  >
    {props.label || props.children}
  </a>
);
