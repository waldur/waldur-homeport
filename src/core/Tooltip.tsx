import { QuestionIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import React, { PropsWithChildren } from 'react';
import { OverlayTrigger, OverlayTriggerProps, Tooltip } from 'react-bootstrap';

export interface TipProps {
  label: React.ReactNode;
  id: string;
  placement?: OverlayTriggerProps['placement'];
  trigger?: OverlayTriggerProps['trigger'];
  rootClose?: OverlayTriggerProps['rootClose'];
  autoWidth?: boolean;
  className?: string;
  tipClassName?: string;
  onClick?(): void;
}

export const Tip: React.FC<PropsWithChildren<TipProps>> = ({
  label,
  id,
  placement,
  trigger,
  children,
  autoWidth,
  className,
  tipClassName,
  onClick,
  ...rest
}) =>
  label ? (
    <OverlayTrigger
      placement={placement}
      trigger={trigger}
      overlay={
        <Tooltip
          id={id}
          className={classNames(
            'tooltip-dark',
            autoWidth && 'tooltip-auto-width',
            tipClassName,
          )}
          style={{ zIndex: 1180 }}
        >
          {label}
        </Tooltip>
      }
      {...rest}
    >
      <span className={className} aria-hidden="true" onClick={onClick}>
        {children}
      </span>
    </OverlayTrigger>
  ) : (
    <span className={className} aria-hidden="true" onClick={onClick} {...rest}>
      {children}
    </span>
  );

export const BackendIdTip = ({ backendId }) =>
  backendId ? (
    <>
      {' '}
      <Tip id="backend-id" label={backendId}>
        <QuestionIcon weight="bold" />
      </Tip>
    </>
  ) : null;
