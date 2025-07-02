import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';
import { ProposalProtectedCallsListData } from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { CallAllFilters } from '@waldur/proposals/call-management/CallAllFilters';
import { CALL_FILTER_FORM_ID } from '@waldur/proposals/constants';
import { Call } from '@waldur/proposals/types';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { getCustomer } from '@waldur/workspace/selectors';

import { formatCallState, getCallStateOptions } from '../utils';

import { CallCreateButton } from './CallCreateButton';
import { CallEditButton } from './CallEditButton';
import { CallExpandableRow } from './CallExpandableRow';

const mapStateToFilter = createSelector(
  getCustomer,
  getFormValues(CALL_FILTER_FORM_ID),
  (customer, filters: any) => {
    const result: ProposalProtectedCallsListData['query'] = {};
    if (customer) {
      result.customer_uuid = customer.uuid;
    }

    if (filters) {
      if (filters.state) {
        result.state = filters.state.map((option) => option.value);
      }
    }
    return result;
  },
);

export const CallManagementPage: FunctionComponent = () => {
  const filter = useSelector(mapStateToFilter);
  const tableProps = useTable({
    table: 'CallManagementList',
    fetchData: createFetcher('proposal-protected-calls'),
    queryField: 'name',
    filter,
  });

  return (
    <Table<Call>
      {...tableProps}
      columns={[
        {
          title: translate('Name'),
          orderField: 'name',
          render: ({ row }) => (
            <Link
              state="protected-call.main"
              params={{ call_uuid: row.uuid }}
              label={row.name}
            />
          ),

          copyField: (row) => row.name,
        },
        {
          title: translate('Created'),
          orderField: 'created',
          render: ({ row }) => <>{formatDateTime(row.created)}</>,
        },
        {
          title: translate('State'),
          orderField: 'state',
          render: ({ row }) => <>{formatCallState(row.state)}</>,
          filter: 'state',
          inlineFilter: (row) =>
            getCallStateOptions().filter((s) => s.value === row.state),
        },
      ]}
      verboseName={translate('Calls')}
      initialSorting={{ field: 'created', mode: 'desc' }}
      rowActions={({ row }) => <CallEditButton row={row} />}
      hasQuery={true}
      tableActions={<CallCreateButton refetch={tableProps.fetch} />}
      expandableRow={CallExpandableRow}
      filters={<CallAllFilters />}
    />
  );
};
