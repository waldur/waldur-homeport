// @flow
import React from 'react';
import BootstrapTooltip from 'react-bootstrap/lib/Tooltip';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';

type Props = {
  label: any,
  children: any,
};

let lastId = 0;

function newid(prefix='id') {
  lastId++;
  return `${prefix}${lastId}`;
}

export const Tooltip = ({ label, children }: Props) => (
  <OverlayTrigger placement='top' overlay={<BootstrapTooltip id={newid()}>{label}</BootstrapTooltip>}>
    {children}
  </OverlayTrigger>
);
