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
  container?: OverlayTriggerProps['container'];
  rootClose?: OverlayTriggerProps['rootClose'];
  delay?: OverlayTriggerProps['delay'];
  autoWidth?: boolean;
  className?: string;
  tipClassName?: string;
  theme?: 'light' | 'dark';
  // Overrides the default tooltip z-index (1180). Needed when the tooltip must
  // sit above a portaled react-select menu (z-index 9999).
  zIndex?: number;
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
  zIndex = 1180,
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
          style={{ zIndex }}
        >
          <div className="tooltip-label">{label}</div>
          {!!body && <div className="tooltip-body">{body}</div>}
        </Tooltip>
      }
      {...rest}
    >
      <span
        className={className}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={
          onClick
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onClick();
                }
              }
            : undefined
        }
      >
        {children}
      </span>
    </OverlayTrigger>
  ) : (
    <span
      className={className}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      {...rest}
    >
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
