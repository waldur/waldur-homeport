import { useSref } from '@uirouter/react';
import classNames from 'classnames';
import React, { forwardRef } from 'react';
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

/**
 * forwardRef so this can compose under a Radix `asChild` trigger/item —
 * Slot clones its child and attaches the ref Radix needs (a menu item's
 * roving-tabindex registration, a popper's anchor). See
 * ActionsDropdown.tsx's TableDropdownToggle for the same requirement
 * stated in more detail.
 */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  (
    {
      state,
      params,
      children,
      label,
      onClick,
      target,
      buttonVariant,
      className,
      ...rest
    },
    ref,
  ) => {
    const sref = useSref(state || '404', params);

    // A link to a state this deployment has disabled is concealed: the content
    // stays, the URL does not. Without this the only gate is the transition hook
    // in transitions.ts, which lets the user reach the URL and then answers with
    // the feature-disabled page.
    if (state && !isStateVisible(state)) {
      return (
        <span ref={ref as any} className={className} {...rest}>
          {label || children}
        </span>
      );
    }

    return (
      <a
        ref={ref}
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
  },
);
Link.displayName = 'Link';
