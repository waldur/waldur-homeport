import { UISref } from '@uirouter/react';
import * as React from 'react';

interface LinkProps {
  label?: React.ReactNode;
  children?: React.ReactNode;
  state: string;
  params?: { [key: string]: string };
  className?: string;
  target?: string;
  onClick?: () => void;
}

export const Link = (props: LinkProps) => (
  <UISref to={props.state} params={props.params}>
    <a
      target={props.target}
      onClick={props.onClick}
      className={props.className}
    >
      {props.label || props.children}
    </a>
  </UISref>
);
