import { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { MarketplaceCustomerServiceAccountsRetrieveResponse } from 'waldur-js-client';

import { CopyToClipboardButton } from '@waldur/core/CopyToClipboardButton';
import { formatDate } from '@waldur/core/dateUtils';
import { CustomerPermissionsLogButton } from '@waldur/customer/team/CustomerPermissionsLogButton';
import { useTeamTableTabs } from '@waldur/customer/team/tabs';
import { TeamDropdownActions } from '@waldur/customer/team/TeamDropdownActions';
import { translate } from '@waldur/i18n';
import { ProjectLink } from '@waldur/project/ProjectLink';
import { ProjectPermissionsLogButton } from '@waldur/project/team/ProjectPermissionsLogButton';
import { TeamDropdownActions as ProjectTeamDropdownActions } from '@waldur/project/team/TeamDropdownActions';
import { PROJECT_TEAM_TABLE_TABS } from '@waldur/project/utils';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { TableProps } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';
import { getCustomer } from '@waldur/workspace/selectors';

import { OrganizationLink } from '../list/OrganizationLink';

import { ServiceAccountActions } from './ServiceAccountActions';
import { ServiceAccountExpandableRow } from './ServiceAccountExpandableRow';
import { ServiceAccountsProps } from './type';

const getContextKey = (context: string) =>
  context === 'customer' ? 'customer_name' : 'project_name';

export const ServiceAccountsTableComponent: FC<
  ServiceAccountsProps & TableProps
> = ({ context, scope, ...tableProps }) => {
  const columns = useMemo(
    () =>
      [
        !scope
          ? ({
              title:
                context === 'customer'
                  ? translate('Organization')
                  : translate('Project'),
              render: ({ row }) =>
                context === 'customer' ? (
                  <OrganizationLink uuid={row.customer_uuid}>
                    {row.customer_name}
                  </OrganizationLink>
                ) : (
                  <ProjectLink
                    row={{ uuid: row.project_uuid, name: row.project_name }}
                  />
                ),

              export: getContextKey(context),
              orderField: getContextKey(context),
            } as any)
          : null,
        {
          title: translate('Username'),
          render: ({ row }) => row.username,
          export: 'username',
        },
        {
          title: translate('Creation date'),
          orderField: 'created',
          render: ({ row }) => formatDate(row.created),
          export: (row) => formatDate(row.created),
        },
        {
          title: translate('Notification email'),
          render: ({ row }) => (
            <div className="d-flex align-items-center gap-1">
              {row.email}
              <CopyToClipboardButton value={row.email} />
            </div>
          ),

          orderField: 'email',
          export: 'email',
        },
      ].filter(Boolean),
    [context, scope],
  );
  return (
    <Table<MarketplaceCustomerServiceAccountsRetrieveResponse>
      columns={columns}
      title={translate('Team')}
      verboseName={translate('Service accounts')}
      hasQuery={true}
      enableExport
      expandableRow={ServiceAccountExpandableRow}
      rowActions={({ row }) => (
        <ServiceAccountActions
          context={context}
          scope={scope}
          row={row}
          refetch={tableProps.fetch}
          admin={!scope}
        />
      )}
      {...tableProps}
    />
  );
};

export const ServiceAccountsList: FC<ServiceAccountsProps> = ({
  context,
  scope,
}) => {
  const filter = useMemo(
    () =>
      context === 'customer'
        ? { customer_uuid: scope.uuid }
        : { project_uuid: scope.uuid },
    [context, scope],
  );
  const tableProps = useTable({
    table: `marketplace-${context}-service-accounts`,
    fetchData: createFetcher(`marketplace-${context}-service-accounts`),
    filter,
    queryField: 'email',
  });

  const tableTabs =
    context === 'customer' ? useTeamTableTabs() : PROJECT_TEAM_TABLE_TABS;

  return (
    <ServiceAccountsTableComponent
      context={context}
      scope={scope}
      {...tableProps}
      tabs={tableTabs}
      tableActions={
        context === 'customer' ? (
          <>
            <CustomerPermissionsLogButton />
            <TeamDropdownActions refetch={tableProps.fetch} />
          </>
        ) : (
          <>
            <ProjectPermissionsLogButton />
            <ProjectTeamDropdownActions
              refetch={tableProps.fetch}
              project={scope}
            />
          </>
        )
      }
    />
  );
};

export const OrganizationServiceAccountsList = () => {
  const customer = useSelector(getCustomer);
  return <ServiceAccountsList context="customer" scope={customer} />;
};
