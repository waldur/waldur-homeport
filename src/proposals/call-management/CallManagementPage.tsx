import { FunctionComponent, useMemo } from 'react';
import { Form, useFormState } from 'react-final-form';
import {
  proposalProtectedCallsList,
  ProposalProtectedCallsListData,
} from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { Call } from '@/proposals/types';
import { createFetcher } from '@/table/api';
import {
  ProposalPublicCallsFilter,
  ProposalPublicCallsFilterFormId,
  selectProposalPublicCallsFilter,
} from '@/table/generated/ProposalPublicCallsFilter';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { useCustomer } from '@/workspace/hooks';

import { formatCallState, getCallStateOptions } from '../utils';

import { CallCreateButton } from './CallCreateButton';
import { CallEditButton } from './CallEditButton';
import { CallExpandableRow } from './CallExpandableRow';

const CallManagementPageTable: FunctionComponent = () => {
  const customer = useCustomer();
  const { values } = useFormState();
  const filterValues = useMemo(
    () => selectProposalPublicCallsFilter(values),
    [values],
  );

  const filter = useMemo(() => {
    const result: ProposalProtectedCallsListData['query'] = { ...filterValues };
    if (customer) {
      result.customer_uuid = customer.uuid;
    }
    return result;
  }, [customer, filterValues]);

  const tableProps = useTable({
    table: 'CallManagementList',
    fetchData: createFetcher(proposalProtectedCallsList),
    queryField: 'name',
    filter,
  });

  return (
    <Table<Call>
      {...tableProps}
      formId={ProposalPublicCallsFilterFormId}
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
      filters={<ProposalPublicCallsFilter />}
    />
  );
};

export const CallManagementPage: FunctionComponent = () => (
  <Form
    id={ProposalPublicCallsFilterFormId}
    onSubmit={() => {}}
    subscription={{ values: true }}
  >
    {() => <CallManagementPageTable />}
  </Form>
);
