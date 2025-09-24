import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { callManagingOrganisationsListUsersList } from 'waldur-js-client';

import { ENV } from '@waldur/core/config';
import { TeamTableComponent } from '@waldur/customer/team/TeamTableComponent';
import { translate } from '@waldur/i18n';
import { GenericPermission } from '@waldur/permissions/types';
import { createFetcher } from '@waldur/table/api';
import { useTable } from '@waldur/table/useTable';
import { getCustomer } from '@waldur/workspace/selectors';

import { UserAddButton } from './UserAddButton';

export const CallManagementTeamPage = () => {
  const customer = useSelector(getCustomer);
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
