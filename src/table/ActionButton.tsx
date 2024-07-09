import classNames from 'classnames';
import { FC, ReactNode } from 'react';
import { Button } from 'react-bootstrap';
import { ButtonVariant } from 'react-bootstrap/esm/types';

import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { Tip } from '@waldur/core/Tooltip';

interface ActionButtonProps {
  title?: string;
  action: (event?: any) => void;
  iconNode?: ReactNode;
  className?: string;
  disabled?: boolean;
  tooltip?: string;
  variant?: ButtonVariant;
  pending?: boolean;
  size?: 'lg' | 'sm';
}

export const wrapTooltip = (label, children, rest?) =>
  label ? (
    <Tip label={label} id="button-tooltip" {...rest}>
      {children}
    </Tip>
  ) : (
    children
  );

export const ActionButton: FC<ActionButtonProps> = ({
  className = 'ms-3',
  variant = 'light',
  ...props
}) =>
  wrapTooltip(
    props.tooltip,
    <Button
      className={classNames(className, {
        disabled: props.disabled || props.pending,
      })}
      size={props.size}
      onClick={props.action}
      variant={variant}
    >
      {props.pending ? (
        <LoadingSpinnerIcon />
      ) : props.iconNode ? (
        <span className="svg-icon svg-icon-2">{props.iconNode}</span>
      ) : null}{' '}
      {props.title}
    </Button>,
  );

export const RowActionButton: FC<ActionButtonProps> = ({
  className,
  variant = 'outline-dark',
  ...props
}) =>
  wrapTooltip(
    props.tooltip,
    <Button
      className={classNames(
        'btn-outline border-gray-400 btn-active-secondary px-2',
        className,
        { disabled: props.disabled || props.pending },
      )}
      onClick={props.action}
      variant={variant}
      size={props.size}
    >
      {props.pending ? (
        <LoadingSpinnerIcon />
      ) : props.iconNode ? (
        <span className="svg-icon svg-icon-2">{props.iconNode}</span>
      ) : null}{' '}
      {props.title}
    </Button>,
  );
