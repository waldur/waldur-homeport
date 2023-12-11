import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { parseDate } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';
import { getCustomer } from '@waldur/workspace/selectors';

import { ProposalProtectedCall } from '../types';

import { CallExpandableRow } from './CallExpandableRow';
import { CallManagementTablePlaceholder } from './CallManagementTablePlaceholder';
import { ProposalCallCreateButton } from './ProposalCallCreateButton';
import { ProposalCallEditButton } from './ProposalCallEditButton';

const getCutoff = (row: ProposalProtectedCall) => {
  const endDate = parseDate(row.end_time);
  if (endDate.diffNow().as('days') > 0) {
    return endDate.toRelative() + ` (${endDate.toISODate()})`;
  } else {
    return translate('Ended') + ` (${endDate.toISODate()})`;
  }
};

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
    <Table<ProposalProtectedCall>
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
          render: ({ row }) => <>{getCutoff(row)}</>,
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
        <>
          <ProposalCallEditButton row={row} refetch={tableProps.fetch} />
          <Link state="#" className="btn btn-dark ms-3">
            {translate('Visit')}
          </Link>
        </>
      )}
      hasQuery={true}
      actions={<ProposalCallCreateButton refetch={tableProps.fetch} />}
      placeholderComponent={<CallManagementTablePlaceholder />}
      expandableRow={CallExpandableRow}
    />
  );
};
