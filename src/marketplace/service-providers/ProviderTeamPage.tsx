import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { marketplaceServiceProvidersListUsersList } from 'waldur-js-client';

import { TeamTableComponent } from '@waldur/customer/team/TeamTableComponent';
import { translate } from '@waldur/i18n';
import { GenericPermission } from '@waldur/permissions/types';
import { ActionsDropdownComponent } from '@waldur/table/ActionsDropdown';
import { createFetcher } from '@waldur/table/api';
import { useTable } from '@waldur/table/useTable';
import { getCustomer } from '@waldur/workspace/selectors';

import { UserAddButton } from './UserAddButton';
import { UserRemoveButton } from './UserRemoveButton';

const RowActions = ({ row, fetch }) => {
  return (
    <ActionsDropdownComponent>
      <UserRemoveButton user={row} refetch={fetch} />
    </ActionsDropdownComponent>
  );
};

export const ProviderTeamPage = () => {
  const customer = useSelector(getCustomer);
  const usersFilter = useMemo(
    () => ({
      scope: customer.service_provider,
    }),
    [customer.service_provider],
  );
  const tableProps = useTable({
    table: 'service-provider-users',
    fetchData: createFetcher(marketplaceServiceProvidersListUsersList, {
      path: { uuid: customer.service_provider_uuid },
    }),
    filter: usersFilter,
    queryField: 'search_string',
  });

  return (
    <TeamTableComponent<GenericPermission>
      {...tableProps}
      context="organization"
      title={translate('Team members')}
      userFieldPrefix="user_"
      tableActions={<UserAddButton refetch={tableProps.fetch} />}
      rowActions={RowActions}
    />
  );
};
