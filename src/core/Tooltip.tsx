import React from 'react';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import BootstrapTooltip from 'react-bootstrap/lib/Tooltip';

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
