import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent, useMemo } from 'react';
import {
  proposalProtectedCallsList,
  ProposalProtectedCallsListData,
} from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { formatDateTime } from '@/core/dateUtils';
import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import {
  buildCallTabs,
  CALL_STATE_VARIANT,
  fetchAllCallCounts,
} from '@/proposals/call-tabs';
import { Call } from '@/proposals/types';
import { createFetcher } from '@/table/api';
import {
  ProposalPublicCallsFilter,
  ProposalPublicCallsFilterFormId,
  selectProposalPublicCallsFilter,
} from '@/table/generated/ProposalPublicCallsFilter';
import Table from '@/table/Table';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';
import { useCustomer } from '@/workspace/hooks';

import { formatCallState, getCallStateOptions } from '../utils';

import { CallCreateButton } from './CallCreateButton';
import { CallEditButton } from './CallEditButton';
import { CallExpandableRow } from './CallExpandableRow';

export const CallManagementPage: FunctionComponent = () => {
  const { params } = useCurrentStateAndParams();
  const customer = useCustomer();
  const values = useFilterValues('CallManagementList');
  const filterValues = useMemo(
    () => selectProposalPublicCallsFilter(values),
    [values],
  );

  const filter = useMemo(() => {
    const result: ProposalProtectedCallsListData['query'] = { ...filterValues };
    if (customer) {
      result.customer_uuid = customer.uuid;
    }
    if (params.state) {
      result.state = params.state;
    }
    return result;
  }, [customer, filterValues, params.state]);

  const { data: counts } = useQuery({
    queryKey: ['callManagementTabCounts', customer?.uuid],
    queryFn: () => {
      const baseQuery: ProposalProtectedCallsListData['query'] = {};
      if (customer) {
        baseQuery.customer_uuid = customer.uuid;
      }
      return fetchAllCallCounts(proposalProtectedCallsList, baseQuery);
    },
    staleTime: 30_000,
  });

  const callTabs = useMemo(() => buildCallTabs(counts), [counts]);

  const tableProps = useTable({
    table: 'CallManagementList',
    syncFiltersToURL: true,
    fetchData: createFetcher(proposalProtectedCallsList),
    queryField: 'name',
    filter,
  });

  return (
    <Table<Call>
      {...tableProps}
      formId={ProposalPublicCallsFilterFormId}
      tabs={callTabs}
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
          render: ({ row }) => (
            <Badge
              variant={CALL_STATE_VARIANT[row.state] || 'secondary'}
              pill
              outline
            >
              {formatCallState(row.state)}
            </Badge>
          ),
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
