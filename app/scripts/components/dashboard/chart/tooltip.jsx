// @flow
import React from 'react';
import BootstrapTooltip from 'react-bootstrap/lib/Tooltip';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';

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
