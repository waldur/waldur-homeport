import { FunctionComponent, useMemo } from 'react';
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

export const ProviderRobotAccountList: FunctionComponent = () => {
  const filterValues = useSelector(
    getFormValues('ProviderRobotAccountFilter'),
  ) as { project?: { uuid } };
  const customer = useSelector(getCustomer);
  const filter = useMemo(
    () => ({
      provider_uuid: customer?.uuid,
      project_uuid: filterValues?.project?.uuid,
    }),
    [filterValues, customer],
  );
  const tableProps = useTable({
    table: 'provider-robot-accounts',
    fetchData: createFetcher('marketplace-robot-accounts'),
    filter,
  });
  const columns = [
    {
      title: translate('Organization'),
      render: ({ row }) => row.customer_name,
    },
    {
      title: translate('Project'),
      render: ({ row }) => row.project_name,
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
    {
      title: translate('Actions'),
      render: ({ row }) => (
        <RobotAccountActions refetch={tableProps.fetch} row={row} />
      ),
    },
  ];

  return (
    <Table
      {...tableProps}
      filters={<ProviderRobotAccountFilter />}
      columns={columns}
      verboseName={translate('robot accounts')}
      hasActionBar={false}
      expandableRow={RobotAccountExpandable}
    />
  );
};
