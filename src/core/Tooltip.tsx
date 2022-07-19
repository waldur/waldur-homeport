import React from 'react';
import { OverlayTrigger, OverlayTriggerProps, Tooltip } from 'react-bootstrap';

interface TipProps {
  label: React.ReactNode;
  id: string;
  placement?: OverlayTriggerProps['placement'];
  autoWidth?: boolean;
  className?: string;
  onClick?(): void;
}

export const Tip: React.FC<TipProps> = ({
  label,
  children,
  id,
  placement,
  autoWidth,
  className,
  onClick,
  ...rest
}) =>
  label ? (
    <OverlayTrigger
      placement={placement}
      overlay={
        <Tooltip id={id} className={autoWidth && 'tooltip-auto-width'}>
          {label}
        </Tooltip>
      }
      {...rest}
    >
      <span className={className} onClick={onClick}>
        {children}
      </span>
    </OverlayTrigger>
  ) : (
    <span className={className} onClick={onClick} {...rest}>
      {children}
    </span>
  );

export const BackendIdTip = ({ backendId }) =>
  backendId ? (
    <>
      {' '}
      <Tip id="backend-id" label={backendId}>
        <i className="fa fa-question-circle" />
      </Tip>
    </>
  ) : null;
