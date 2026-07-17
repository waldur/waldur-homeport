import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { userPermissionsList } from 'waldur-js-client';

import { LoadingSpinnerSimple } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import { PermissionDetails } from '@/user/affiliations/PermissionDetails';
import { useUser } from '@/workspace/hooks';
import { Customer } from '@/workspace/types';

export const OrganizationExpandableRow: React.FC<{
  row: Customer;
}> = ({ row }) => {
  const user = useUser();
  // The `me` bootstrap payload trims provenance fields (role_description,
  // created_by_*, created), so read the current user's roles on this org from
  // the full user-permissions endpoint, which PermissionDetails renders.
  const {
    data: permissions,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['OrganizationExpandableRow', 'permissions', user.uuid, row.uuid],
    queryFn: async () => {
      const response = await userPermissionsList({
        query: {
          user: user.uuid,
          scope_type: 'customer',
          scope_uuid: row.uuid,
        },
      });
      return response.data;
    },
  });

  if (isLoading) {
    return <LoadingSpinnerSimple />;
  }
  if (error) {
    return <>{translate('Unable to load permissions data.')}</>;
  }
  return !permissions || permissions.length === 0 ? (
    <>{translate('No permissions data.')}</>
  ) : (
    <ExpandableContainer asTable>
      {permissions.map((permission) => (
        <PermissionDetails key={permission.uuid} permission={permission} />
      ))}
    </ExpandableContainer>
  );
};
