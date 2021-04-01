import React from 'react';
import { OverlayTrigger, Tooltip as BootstrapTooltip } from 'react-bootstrap';

interface TooltipProps {
  label: React.ReactNode;
  id: string;
  className?: string;
  onClick?(): void;
}

export const Tooltip: React.FC<TooltipProps> = ({
  label,
  children,
  id,
  className,
  onClick,
  ...rest
}) => (
  <OverlayTrigger
    placement="top"
    overlay={<BootstrapTooltip id={id}>{label}</BootstrapTooltip>}
    {...rest}
  >
    <span className={className} onClick={onClick}>
      {children}
    </span>
  </OverlayTrigger>
);

export const BackendIdTooltip = ({ backendId }) =>
  backendId ? (
    <>
      {' '}
      <Tooltip id="backend-id" label={backendId}>
        <i className="fa fa-question-circle" />
      </Tooltip>
    </>
  ) : null;
