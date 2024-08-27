import React from 'react';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';
import { getUser } from '@waldur/workspace/selectors';
import { Customer } from '@waldur/workspace/types';

import { PermissionDetails } from './PermissionDetails';

export const OrganizationExpandableRow: React.FC<{
  row: Customer;
}> = ({ row }) => {
  const user = useSelector(getUser);
  const permissions =
    user.permissions?.filter(
      (permission) =>
        permission.scope_type === 'customer' &&
        permission.scope_uuid === row.uuid,
    ) || [];
  return permissions.length === 0 ? (
    <>{translate('No permissions data.')}</>
  ) : (
    <ExpandableContainer asTable>
      {permissions.map((permission, index) => (
        <PermissionDetails key={index} permission={permission} />
      ))}
    </ExpandableContainer>
  );
};
