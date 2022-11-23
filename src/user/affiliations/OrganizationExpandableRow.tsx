import React from 'react';
import { Container } from 'react-bootstrap';

import { CustomerPermission } from '@waldur/workspace/types';

import { PermissionDetails } from './PermissionDetails';

export const OrganizationExpandableRow: React.FC<{
  row: CustomerPermission;
}> = ({ row }) => (
  <Container>
    <PermissionDetails row={row} />
  </Container>
);
