import { useMemo } from 'react';
import { callManagingOrganisationsListUsersList } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { TeamTableComponent } from '@/customer/team/TeamTableComponent';
import { translate } from '@/i18n';
import { GenericPermission } from '@/permissions/types';
import { createFetcher } from '@/table/api';
import { useTable } from '@/table/useTable';
import { useCustomer } from '@/workspace/hooks';

import { UserAddButton } from './UserAddButton';

export const CallManagementTeamPage = () => {
  const customer = useCustomer();
  const scopeFilter = `${ENV.apiEndpoint}api/call-managing-organisations/${customer.call_managing_organization_uuid}/`;
  const usersFilter = useMemo(
    () => ({
      scope: scopeFilter,
    }),
    [scopeFilter],
  );
  const tableProps = useTable({
    table: `CallManagementTeamPage/${customer.call_managing_organization_uuid}`,
    fetchData: createFetcher(callManagingOrganisationsListUsersList, {
      path: { uuid: customer.call_managing_organization_uuid },
    }),
    filter: usersFilter,
    queryField: 'search_string',
  });

  return (
    <TeamTableComponent<GenericPermission>
      {...tableProps}
      userFieldPrefix="user_"
      title={translate('Team members')}
      tableActions={<UserAddButton refetch={tableProps.fetch} />}
    />
  );
};
