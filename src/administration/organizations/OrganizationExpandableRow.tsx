import React from 'react';

import { translate } from '@/i18n';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import { PermissionDetails } from '@/user/affiliations/PermissionDetails';
import { useUser } from '@/workspace/hooks';
import { Customer } from '@/workspace/types';

export const OrganizationExpandableRow: React.FC<{
  row: Customer;
}> = ({ row }) => {
  const user = useUser();
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
