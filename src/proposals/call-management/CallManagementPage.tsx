import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { ProposalCall } from '@waldur/proposals/types';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';
import { getCustomer } from '@waldur/workspace/selectors';

import { CallExpandableRow } from './CallExpandableRow';
import { CallManagementTablePlaceholder } from './CallManagementTablePlaceholder';
import { ProposalCallCreateButton } from './ProposalCallCreateButton';
import { ProposalCallEditButton } from './ProposalCallEditButton';

export const CallManagementPage: FunctionComponent = () => {
  const customer = useSelector(getCustomer);
  const filter = useMemo(() => ({ customer_uuid: customer.uuid }), [customer]);
  const tableProps = useTable({
    table: 'CallMamagementList',
    fetchData: createFetcher('proposal-protected-calls'),
    queryField: 'name',
    filter,
  });

  return (
    <Table<ProposalCall>
      {...tableProps}
      columns={[
        {
          title: translate('Name'),
          orderField: 'name',
          render: ({ row }) => <>{row.name}</>,
        },
        {
          title: translate('Cutoff'),
          orderField: 'end_time',
          render: ({ row }) => <>{row.end_time}</>,
        },
        {
          title: translate('State'),
          orderField: 'state',
          render: ({ row }) => <>{row.state}</>,
        },
      ]}
      verboseName={translate('Call management')}
      initialSorting={{ field: 'end_time', mode: 'desc' }}
      hoverableRow={({ row }) => (
        <ProposalCallEditButton row={row} refetch={tableProps.fetch} />
      )}
      hasQuery={true}
      actions={<ProposalCallCreateButton refetch={tableProps.fetch} />}
      placeholderComponent={<CallManagementTablePlaceholder />}
      expandableRow={CallExpandableRow}
    />
  );
};
