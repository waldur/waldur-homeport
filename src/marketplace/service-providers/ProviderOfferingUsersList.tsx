import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';

import { formatDateTime } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { createFetcher, Table } from '@waldur/table';
import { useTable } from '@waldur/table/utils';
import { getCustomer, getUser } from '@waldur/workspace/selectors';

import { CustomerResourcesListPlaceholder } from '../resources/list/CustomerResourcesListPlaceholder';

import { PROVIDER_OFFERING_USERS_FORM_ID } from './constants';
import { ProviderOfferingUsersFilter } from './ProviderOfferingUsersFilter';
import { ProviderOfferingUserUpdateButton } from './ProviderOfferingUserUpdateButton';
import { RestrictOfferingUserButton } from './RestrictOfferingUser';

export const ProviderOfferingUsersListComponent: FunctionComponent<{
  provider?;
  hasOrganizationColumn?: boolean;
}> = ({ provider, hasOrganizationColumn }) => {
  const user = useSelector(getUser);
  const customer = useSelector(getCustomer);

  const canUpdateRestrictedStatus = hasPermission(user, {
    permission: PermissionEnum.UPDATE_OFFERING_USER_RESTRICTION,
    customerId: customer.uuid,
  });

  const filterValues = useSelector(
    getFormValues(PROVIDER_OFFERING_USERS_FORM_ID),
  ) as { offering?; provider? };
  const filter = useMemo(
    () => ({
      provider_uuid: hasOrganizationColumn
        ? filterValues?.provider?.customer_uuid
        : provider?.customer_uuid,
      offering_uuid: filterValues?.offering?.uuid,
    }),
    [provider, filterValues],
  );
  const tableProps = useTable({
    table: 'marketplace-offering-users',
    fetchData: createFetcher(`marketplace-offering-users`),
    filter,
    queryField: 'query',
  });
  const organizationColumn = hasOrganizationColumn
    ? [
        {
          title: translate('Organization'),
          render: ({ row }) => row.customer_name,
          filter: 'provider',
        },
      ]
    : [];
  const columns = [
    {
      title: translate('Offering'),
      render: ({ row }) => (
        <Link
          state="public-offering.marketplace-public-offering"
          params={{ uuid: row.offering_uuid }}
          label={row.offering_name}
        />
      ),
      filter: 'offering',
    },
    ...organizationColumn,
    {
      title: translate('User'),
      render: ({ row }) => row.user_full_name,
    },
    {
      title: translate('External username'),
      render: ({ row }) => row.username || 'N/A',
      orderField: 'username',
    },
    {
      title: translate('Created'),
      render: ({ row }) => formatDateTime(row.created),
      orderField: 'created',
    },
    {
      title: translate('Modified'),
      render: ({ row }) => formatDateTime(row.modified),
      orderField: 'modified',
    },
    {
      title: translate('Propagated'),
      render: ({ row }) =>
        row.propagation_date ? formatDateTime(row.propagation_date) : 'N/A',
      orderField: 'propagation_date',
    },
  ];
  return (
    <Table
      {...tableProps}
      columns={columns}
      verboseName={translate('Offering users')}
      showPageSizeSelector={true}
      filters={
        <ProviderOfferingUsersFilter
          hasOrganizationColumn={hasOrganizationColumn}
        />
      }
      rowActions={({ row }) => (
        <>
          <ProviderOfferingUserUpdateButton
            row={row}
            provider={provider}
            refetch={tableProps.fetch}
          />
          {canUpdateRestrictedStatus && (
            <RestrictOfferingUserButton row={row} refetch={tableProps.fetch} />
          )}
        </>
      )}
      hasQuery={true}
    />
  );
};

export const ProviderOfferingUsersList = ({ provider }) => {
  if (!provider) {
    return <CustomerResourcesListPlaceholder />;
  }
  return <ProviderOfferingUsersListComponent provider={provider} />;
};
