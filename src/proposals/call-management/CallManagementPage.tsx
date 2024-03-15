import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { formatDateTime } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { CallAllFilters } from '@waldur/proposals/call-management/CallAllFilters';
import { CALL_FILTER_FORM_ID } from '@waldur/proposals/constants';
import { ProposalCall } from '@waldur/proposals/types';
import { createFetcher, Table } from '@waldur/table';
import { useTable } from '@waldur/table/utils';
import { getCustomer } from '@waldur/workspace/selectors';

import { CallCreateButton } from './CallCreateButton';
import { CallEditButton } from './CallEditButton';
import { CallExpandableRow } from './CallExpandableRow';
import { CallManagementTablePlaceholder } from './CallManagementTablePlaceholder';

const mapPropsToFilter = createSelector(
  getCustomer,
  getFormValues(CALL_FILTER_FORM_ID),
  (customer, filters: any) => {
    const result: Record<string, any> = {};
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
  const filter = useSelector(mapPropsToFilter);
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
              state="call-management.protected-call-update-details"
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
      verboseName={translate('Calls')}
      initialSorting={{ field: 'name', mode: 'desc' }}
      hoverableRow={({ row }) => <CallEditButton row={row} />}
      hasQuery={true}
      actions={<CallCreateButton refetch={tableProps.fetch} />}
      placeholderComponent={<CallManagementTablePlaceholder />}
      expandableRow={CallExpandableRow}
      filters={<CallAllFilters />}
    />
  );
};
