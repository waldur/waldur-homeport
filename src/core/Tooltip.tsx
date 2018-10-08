import * as React from 'react';
import * as OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import * as BootstrapTooltip from 'react-bootstrap/lib/Tooltip';

interface Props {
  label: React.ReactNode;
  children: React.ReactNode;
  id: string;
  className?: string;
  onClick?(): void;
}

export const Tooltip = ({ label, children, id, className, onClick }: Props) => (
  <OverlayTrigger placement="top" overlay={<BootstrapTooltip id={id}>{label}</BootstrapTooltip>}>
    <span className={className} onClick={onClick}>
      {children}
    </span>
  </OverlayTrigger>
);
