import { FC, useMemo } from 'react';
import {
  marketplaceRobotAccountsList,
  RobotAccountDetails,
} from 'waldur-js-client';

import { CopyToClipboardContainer } from '@/core/CopyToClipboardContainer';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import {
  MarketplaceRobotAccountsFilter,
  selectMarketplaceRobotAccountsFilter,
  MarketplaceRobotAccountsFilterFormId,
} from '@/table/generated/MarketplaceRobotAccountsFilter';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';
import { useCustomer } from '@/workspace/hooks';

import { RobotAccountActions } from './RobotAccountActions';
import { RobotAccountExpandable } from './RobotAccountExpandable';

export const ProviderRobotAccountList: FC<{ provider }> = ({ provider }) => {
  const values = useFilterValues('provider-robot-accounts');

  const formFilter = useMemo(
    () => selectMarketplaceRobotAccountsFilter(values),
    [values],
  );

  const customer = useCustomer();
  const filter = useMemo(() => {
    const baseFilter: any = {
      ...formFilter,
    };

    if (provider) {
      baseFilter.provider_uuid = customer?.uuid;
    }

    return baseFilter;
  }, [formFilter, customer, provider]);

  const tableProps = useTable({
    table: 'provider-robot-accounts',
    syncFiltersToURL: true,
    fetchData: createFetcher(marketplaceRobotAccountsList),
    filter,
  });

  const columns: Column<RobotAccountDetails>[] = [
    {
      title: translate('Organization'),
      render: ({ row }) => row.customer_name,
      filter: 'customer',
      inlineFilter: (row) => ({
        name: row.customer_name,
        uuid: row.customer_uuid,
      }),
    },
    {
      title: translate('Project'),
      render: ({ row }) => row.project_name,
      filter: 'project_uuid',
      inlineFilter: (row) => ({
        name: row.project_name,
        uuid: row.project_uuid,
      }),
    },
    {
      title: translate('Resource'),
      render: ({ row }) => row.resource_name,
    },
    {
      title: translate('Type'),
      render: ({ row }) => renderFieldOrDash(row.type),
    },
    {
      title: translate('Username'),
      render: ({ row }) =>
        row.username ? (
          <CopyToClipboardContainer value={row.username} />
        ) : (
          'N/A'
        ),
    },
  ];

  return (
    <Table<RobotAccountDetails>
      {...tableProps}
      filters={
        // The generated filter queries provider-scoped endpoints, so it
        // only makes sense (and only works) when a provider is in scope —
        // the support view renders this list without one.
        provider ? (
          <MarketplaceRobotAccountsFilter provider={provider} />
        ) : undefined
      }
      columns={columns}
      verboseName={translate('robot accounts')}
      expandableRow={RobotAccountExpandable}
      rowActions={({ row }) => (
        <RobotAccountActions refetch={tableProps.fetch} row={row} />
      )}
      formId={MarketplaceRobotAccountsFilterFormId}
    />
  );
};
