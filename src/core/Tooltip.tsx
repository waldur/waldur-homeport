import { QuestionIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import React, { PropsWithChildren } from 'react';
import { OverlayTrigger, OverlayTriggerProps, Tooltip } from 'react-bootstrap';

export interface TipProps {
  label: React.ReactNode;
  body?: React.ReactNode;
  id: string;
  placement?: OverlayTriggerProps['placement'];
  trigger?: OverlayTriggerProps['trigger'];
  rootClose?: OverlayTriggerProps['rootClose'];
  delay?: OverlayTriggerProps['delay'];
  autoWidth?: boolean;
  className?: string;
  tipClassName?: string;
  theme?: 'light' | 'dark';
  onClick?(): void;
}

export const Tip: React.FC<PropsWithChildren<TipProps>> = ({
  label,
  body,
  id,
  placement,
  trigger,
  children,
  autoWidth,
  className,
  tipClassName,
  onClick,
  theme = 'dark',
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
            `tooltip-${theme}`,
            autoWidth && 'tooltip-auto-width',
            tipClassName,
            body && 'has-body',
          )}
          style={{ zIndex: 1180 }}
        >
          <div className="tooltip-label">{label}</div>
          {!!body && <div className="tooltip-body">{body}</div>}
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
