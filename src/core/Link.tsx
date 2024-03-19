import { UISref } from '@uirouter/react';
import React, { FunctionComponent } from 'react';

interface LinkProps {
  label?: React.ReactNode;
  children?: React.ReactNode;
  state: string;
  params?: object;
  className?: string;
  target?: string;
  onClick?: (e?) => void;
}

export const Link: FunctionComponent<LinkProps> = (props) => (
  <UISref to={props.state} params={props.params}>
    {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
    <a
      target={props.target}
      onClick={props.onClick}
      className={props.className}
      onKeyPress={(e) => e.key === 'Enter' && props.onClick(e)}
      role={props.onClick ? 'button' : undefined}
    >
      {props.label || props.children}
    </a>
  </UISref>
);
