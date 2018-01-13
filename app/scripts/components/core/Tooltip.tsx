import * as React from 'react';
import * as OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import * as BootstrapTooltip from 'react-bootstrap/lib/Tooltip';

interface Props {
  label: any;
  children: any;
  id: string;
}

export const Tooltip = ({ label, children, id }: Props) => (
  <OverlayTrigger placement="top" overlay={<BootstrapTooltip id={id}>{label}</BootstrapTooltip>}>
    <span>
      {children}
    </span>
  </OverlayTrigger>
);
