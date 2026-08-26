import { useSref } from '@uirouter/react';
import classNames from 'classnames';
import React, { FunctionComponent } from 'react';
import { Variant } from 'react-bootstrap/esm/types';

import { isStateVisible } from './stateVisibility';

interface LinkProps {
  label?: React.ReactNode;
  children?: React.ReactNode;
  state: string;
  params?: object;
  buttonVariant?: Variant;
  className?: string;
  target?: string;
  onClick?: (e?) => void;
}

export const Link: FunctionComponent<LinkProps> = ({
  state,
  params,
  children,
  label,
  onClick,
  target,
  buttonVariant,
  className,
  ...rest
}) => {
  const sref = useSref(state || '404', params);

  // A link to a state this deployment has disabled is concealed: the content
  // stays, the URL does not. Without this the only gate is the transition hook
  // in transitions.ts, which lets the user reach the URL and then answers with
  // the feature-disabled page.
  if (state && !isStateVisible(state)) {
    return (
      <span className={className} {...rest}>
        {label || children}
      </span>
    );
  }

  return (
    <a
      {...(state ? sref : {})}
      target={target}
      onClick={(e) => {
        sref.onClick?.(e);
        onClick?.(e);
        e.preventDefault();
      }}
      className={classNames(
        buttonVariant && 'btn btn-' + buttonVariant,
        className,
        typeof (label || children) === 'string' &&
          !(className || '').includes('btn') &&
          'text-anchor',
      )}
      onKeyDown={(e) => e.key === 'Enter' && onClick(e)}
      role={onClick ? 'button' : undefined}
      {...rest}
    >
      {label || children}
    </a>
  );
};
