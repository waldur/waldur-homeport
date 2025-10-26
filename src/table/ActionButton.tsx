import classNames from 'classnames';
import { FC, ReactNode } from 'react';
import { Button } from 'react-bootstrap';
import { ButtonVariant } from 'react-bootstrap/esm/types';
import MediaQuery from 'react-responsive';

import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { Tip } from '@waldur/core/Tooltip';

interface ActionButtonProps {
  title?: string;
  action: (event?: any) => void;
  iconNode?: ReactNode;
  iconRight?: boolean;
  className?: string;
  disabled?: boolean;
  tooltip?: string;
  variant?: ButtonVariant;
  pending?: boolean;
  size?: 'lg' | 'sm';
  visibility?: {
    minWidth?: number;
    maxWidth?: number;
  };
}

export const wrapTooltip = (label, children, rest?) =>
  label ? (
    <Tip label={label} id="button-tooltip" {...rest}>
      {children}
    </Tip>
  ) : (
    children
  );

const ActionButtonPure: FC<ActionButtonProps> = ({
  className,
  variant = 'tertiary',
  ...props
}) =>
  wrapTooltip(
    props.tooltip,
    <Button
      className={classNames(className, {
        disabled: props.disabled || props.pending,
        'btn-icon': !props.title && props.iconNode,
        'btn-icon-right': props.iconRight,
      })}
      size={props.size}
      onClick={props.action}
      variant={variant}
      disabled={props.disabled || props.pending}
      data-testid={props['data-testid']}
    >
      {props.iconRight && props.title}
      {props.pending ? (
        <LoadingSpinnerIcon />
      ) : props.iconNode ? (
        <span
          className={`svg-icon svg-icon-${props.size === 'sm' && props.title ? '4' : '2'}`}
        >
          {props.iconNode}
        </span>
      ) : null}
      {!props.iconRight && props.title}
    </Button>,
  );

export const ActionButton: FC<ActionButtonProps> = (props) => {
  return props.visibility ? (
    <MediaQuery {...props.visibility}>
      <ActionButtonPure {...props} />
    </MediaQuery>
  ) : (
    <ActionButtonPure {...props} />
  );
};

export const RowActionButton: FC<ActionButtonProps> = ({
  className,
  variant = 'tertiary',
  ...props
}) =>
  wrapTooltip(
    props.tooltip,
    <Button
      className={classNames(className, {
        disabled: props.disabled || props.pending,
      })}
      onClick={props.action}
      variant={variant}
      size={props.size}
      disabled={props.disabled || props.pending}
    >
      {props.pending ? (
        <LoadingSpinnerIcon />
      ) : props.iconNode ? (
        <span className="svg-icon svg-icon-2">{props.iconNode}</span>
      ) : null}{' '}
      {props.title}
    </Button>,
  );
