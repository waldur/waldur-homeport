import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

interface TipProps {
  label: React.ReactNode;
  id: string;
  autoWidth?: boolean;
  className?: string;
  onClick?(): void;
}

export const Tip: React.FC<TipProps> = ({
  label,
  children,
  id,
  autoWidth,
  className,
  onClick,
  ...rest
}) => (
  <OverlayTrigger
    placement="top"
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
