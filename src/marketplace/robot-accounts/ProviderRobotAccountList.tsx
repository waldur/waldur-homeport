import { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';

import { CopyToClipboardContainer } from '@waldur/core/CopyToClipboardContainer';
import { translate } from '@waldur/i18n';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';
import { getCustomer } from '@waldur/workspace/selectors';

import { ProviderRobotAccountFilter } from './ProviderRobotAccountFilter';
import { RobotAccountActions } from './RobotAccountActions';
import { RobotAccountExpandable } from './RobotAccountExpandable';

interface FilterValues {
  project?: { uuid };
  customer?: { uuid };
}

export const ProviderRobotAccountList: FC<{ provider }> = ({ provider }) => {
  const filterValues = useSelector(
    getFormValues('ProviderRobotAccountFilter'),
  ) as FilterValues;
  const customer = useSelector(getCustomer);
  const filter = useMemo(() => {
    const baseFilter: {
      project_uuid?: string;
      customer_uuid?: string;
      provider_uuid?: string;
    } = {
      project_uuid: filterValues?.project?.uuid,
      customer_uuid: filterValues?.customer?.uuid,
    };

    if (provider) {
      baseFilter.provider_uuid = customer?.uuid;
    }

    return baseFilter;
  }, [filterValues, customer]);

  const tableProps = useTable({
    table: 'provider-robot-accounts',
    fetchData: createFetcher('marketplace-robot-accounts'),
    filter,
  });

  const columns = [
    {
      title: translate('Organization'),
      render: ({ row }) => row.customer_name,
      filter: 'customer',
    },
    {
      title: translate('Project'),
      render: ({ row }) => row.project_name,
      filter: 'project',
    },
    {
      title: translate('Resource'),
      render: ({ row }) => row.resource_name,
    },
    {
      title: translate('Type'),
      render: ({ row }) => row.type || 'N/A',
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
    <Table
      {...tableProps}
      filters={<ProviderRobotAccountFilter provider={provider} />}
      columns={columns}
      verboseName={translate('robot accounts')}
      expandableRow={RobotAccountExpandable}
      rowActions={({ row }) => (
        <RobotAccountActions refetch={tableProps.fetch} row={row} />
      )}
    />
  );
};
