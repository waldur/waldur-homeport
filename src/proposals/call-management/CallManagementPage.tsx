import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { formatDateTime } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { ProposalCall } from '@waldur/proposals/types';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';
import { getCustomer } from '@waldur/workspace/selectors';

import { CallCreateButton } from './CallCreateButton';
import { CallEditButton } from './CallEditButton';
import { CallExpandableRow } from './CallExpandableRow';
import { CallManagementTablePlaceholder } from './CallManagementTablePlaceholder';

export const CallManagementPage: FunctionComponent = () => {
  const customer = useSelector(getCustomer);
  const filter = useMemo(() => ({ customer_uuid: customer.uuid }), [customer]);
  const tableProps = useTable({
    table: 'CallManagementList',
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
          render: ({ row }) => (
            <Link
              state="protected-call-update"
              params={{ call_uuid: row.uuid }}
              label={row.name}
            />
          ),
        },
        {
          title: translate('Created'),
          orderField: 'created',
          render: ({ row }) => <>{formatDateTime(row.created)}</>,
        },
        {
          title: translate('State'),
          orderField: 'state',
          render: ({ row }) => <>{row.state}</>,
        },
      ]}
      verboseName={translate('Call management')}
      initialSorting={{ field: 'name', mode: 'desc' }}
      hoverableRow={({ row }) => <CallEditButton row={row} />}
      hasQuery={true}
      actions={<CallCreateButton refetch={tableProps.fetch} />}
      placeholderComponent={<CallManagementTablePlaceholder />}
      expandableRow={CallExpandableRow}
    />
  );
};
