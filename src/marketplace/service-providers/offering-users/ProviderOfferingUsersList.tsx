import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { marketplaceOfferingUsersList } from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { OfferingUserRowActions } from '@waldur/marketplace/offerings/actions/OfferingUserRowActions';
import { UserImportButton } from '@waldur/marketplace/offerings/import-users/UserImportButton';
import { OfferingUserStateField } from '@waldur/marketplace/OfferingUserStateField';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { TableWithPortal } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';

import { PROVIDER_OFFERING_USERS_FORM_ID } from '../constants';

import { CreateProviderOfferingUserButton } from './CreateProviderOfferingUserButton';
import { OfferingUsersExpandableRow } from './OfferingUsersExpandableRow';
import { ProviderOfferingUsersFilter } from './ProviderOfferingUsersFilter';

export const ProviderOfferingUsersListComponent: FunctionComponent<
  Partial<TableWithPortal> & {
    provider?;
    hasOrganizationColumn?: boolean;
  }
> = ({ provider, hasOrganizationColumn, portal }) => {
  const filterValues = useSelector(
    getFormValues(PROVIDER_OFFERING_USERS_FORM_ID),
  ) as { offering?; provider?; state?: Array<{ value: any }> };
  const filter = useMemo(
    () => ({
      provider_uuid: hasOrganizationColumn
        ? filterValues?.provider?.customer_uuid
        : provider?.customer_uuid,
      offering_uuid: filterValues?.offering?.uuid,
      state: filterValues?.state?.map((option) => option.value),
    }),
    [provider, filterValues],
  );
  const tableProps = useTable({
    table: 'marketplace-offering-users',
    fetchData: createFetcher(marketplaceOfferingUsersList),
    filter,
    queryField: 'query',
  });
  const organizationColumn = hasOrganizationColumn
    ? [
        {
          title: translate('Organization'),
          render: ({ row }) => row.customer_name,
          filter: 'provider',
          inlineFilter: (row) => ({
            customer_name: row.customer_name,
            customer_uuid: row.customer_uuid,
          }),
        },
      ]
    : [];
  const stateColumn = provider
    ? [
        {
          title: translate('Account state'),
          render: OfferingUserStateField,
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
      inlineFilter: (row) => ({
        name: row.offering_name,
        uuid: row.offering_uuid,
      }),
    },
    ...organizationColumn,
    {
      title: translate('User'),
      render: ({ row }) => row.user_full_name,
    },
    ...stateColumn,
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
      portal={portal}
      hasActionBar={!portal}
      cardBordered={!portal}
      fullWidth={!!portal}
      tableActions={
        <>
          <UserImportButton refetch={tableProps.fetch} provider={provider} />
          <CreateProviderOfferingUserButton
            refetch={tableProps.fetch}
            provider={provider}
          />
        </>
      }
      rowActions={({ row }) => (
        <OfferingUserRowActions
          row={row}
          fetch={tableProps.fetch}
          provider={provider}
        />
      )}
      hasQuery={true}
      expandableRow={provider ? OfferingUsersExpandableRow : undefined}
    />
  );
};
