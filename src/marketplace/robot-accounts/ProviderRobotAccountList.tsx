import { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  marketplaceRobotAccountsList,
  RobotAccountDetails,
} from 'waldur-js-client';

import { CopyToClipboardContainer } from '@waldur/core/CopyToClipboardContainer';
import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import {
  MarketplaceRobotAccountsFilter,
  selectMarketplaceRobotAccountsFilter,
} from '@waldur/table/generated/MarketplaceRobotAccountsFilter';
import Table from '@waldur/table/Table';
import { Column } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';
import { getCustomer } from '@waldur/workspace/selectors';

import { RobotAccountActions } from './RobotAccountActions';
import { RobotAccountExpandable } from './RobotAccountExpandable';

export const ProviderRobotAccountList: FC<{ provider }> = ({ provider }) => {
  const formFilter = useSelector(selectMarketplaceRobotAccountsFilter);
  const customer = useSelector(getCustomer);
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
      filter: 'project',
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
      filters={<MarketplaceRobotAccountsFilter provider={provider} />}
      columns={columns}
      verboseName={translate('robot accounts')}
      expandableRow={RobotAccountExpandable}
      rowActions={({ row }) => (
        <RobotAccountActions refetch={tableProps.fetch} row={row} />
      )}
    />
  );
};
