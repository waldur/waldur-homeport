import * as React from 'react';
import * as BootstrapTooltip from 'react-bootstrap/lib/Tooltip';
import * as OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';

type Props = {
  label: any,
  children: any,
  id: string,
};

export const Tooltip = ({ label, children, id }: Props) => (
  <OverlayTrigger placement='top' overlay={<BootstrapTooltip id={id}>{label}</BootstrapTooltip>}>
    {children}
  </OverlayTrigger>
);
