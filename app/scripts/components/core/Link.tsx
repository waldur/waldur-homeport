import * as React from 'react';

import { $state } from './services';

interface LinkProps {
  label: React.ReactNode;
  state: string;
  params?: {[key: string]: string};
}

export const Link = (props: LinkProps) => (
  <a href={$state.href(props.state, props.params)}>
    {props.label}
  </a>
);
