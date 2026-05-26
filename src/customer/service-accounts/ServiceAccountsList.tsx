import { FC, useMemo } from 'react';
import {
  marketplaceCustomerServiceAccountsList,
  marketplaceProjectServiceAccountsList,
  MarketplaceCustomerServiceAccountsRetrieveResponse,
  CustomerServiceAccount,
} from 'waldur-js-client';

import { CopyToClipboardButton } from '@/core/CopyToClipboardButton';
import { formatDate } from '@/core/dateUtils';
import { CustomerPermissionsLogButton } from '@/customer/team/CustomerPermissionsLogButton';
import { useTeamTableTabs } from '@/customer/team/tabs';
import { TeamDropdownActions } from '@/customer/team/TeamDropdownActions';
import { translate } from '@/i18n';
import { ProjectLink } from '@/project/ProjectLink';
import { ProjectPermissionsLogButton } from '@/project/team/ProjectPermissionsLogButton';
import { useTeamTableTabs as useProjectTeamTableTabs } from '@/project/team/tabs';
import { TeamDropdownActions as ProjectTeamDropdownActions } from '@/project/team/TeamDropdownActions';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { Column, TableProps } from '@/table/types';
import { useTable } from '@/table/useTable';
import { useCustomer } from '@/workspace/hooks';

import { OrganizationLink } from '../list/OrganizationLink';

import { ServiceAccountActions } from './ServiceAccountActions';
import { ServiceAccountExpandableRow } from './ServiceAccountExpandableRow';
import { ServiceAccountsProps } from './type';

const getContextKey = (context: string) =>
  context === 'customer' ? 'customer_name' : 'project_name';

export const ServiceAccountsTableComponent: FC<
  ServiceAccountsProps & TableProps
> = ({ context, scope, ...tableProps }) => {
  const columns = useMemo<
    Array<Column<MarketplaceCustomerServiceAccountsRetrieveResponse>>
  >(
    () =>
      [
        !scope
          ? {
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

              export: getContextKey(context) as keyof CustomerServiceAccount,
              orderField: getContextKey(context),
            }
          : null,
        {
          title: translate('Username'),
          render: ({ row }) => row.username,
          export: 'username' as keyof CustomerServiceAccount,
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
          export: 'email' as keyof CustomerServiceAccount,
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
    fetchData: createFetcher(
      context === 'customer'
        ? marketplaceCustomerServiceAccountsList
        : marketplaceProjectServiceAccountsList,
    ),
    filter,
    queryField: 'email',
  });

  const tableTabs =
    context === 'customer'
      ? useTeamTableTabs()
      : useProjectTeamTableTabs(scope);

  return (
    <ServiceAccountsTableComponent
      context={context}
      scope={scope}
      {...tableProps}
      tabs={tableTabs}
      tableActions={
        context === 'customer' ? (
          <TeamDropdownActions refetch={tableProps.fetch} />
        ) : (
          <ProjectTeamDropdownActions
            refetch={tableProps.fetch}
            project={scope}
          />
        )
      }
      dropdownActions={
        context === 'customer' ? (
          <CustomerPermissionsLogButton />
        ) : (
          <ProjectPermissionsLogButton asDropdownItem />
        )
      }
      showExportInDropdown
    />
  );
};

export const OrganizationServiceAccountsList = () => {
  const customer = useCustomer();
  return <ServiceAccountsList context="customer" scope={customer} />;
};
