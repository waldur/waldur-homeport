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
  resolveCallStateFilter,
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
import { renderFieldOrDash } from '@/table/utils';
import { useCustomer } from '@/workspace/hooks';

import { formatCallState, getCallStateOptions } from '../utils';

import { CallCreateButton } from './CallCreateButton';
import { CallExpandableRow } from './CallExpandableRow';

interface CallManagementPageProps {
  /**
   * Narrow the list to the organisation currently in context.
   *
   * True on an organisation's own Call management tab. False for the standalone
   * "Manage calls" page, which answers "the calls I can manage" across every
   * organisation — `useCustomer()` reads workspace state that survives
   * navigation, so leaving it to chance would silently scope that page to
   * whichever organisation happened to be visited last.
   */
  scopeToCustomer?: boolean;
}

export const CallManagementPage: FunctionComponent<CallManagementPageProps> = ({
  scopeToCustomer = true,
}) => {
  const { params } = useCurrentStateAndParams();
  const selectedCustomer = useCustomer();
  const customer = scopeToCustomer ? selectedCustomer : undefined;
  const values = useFilterValues('CallManagementList');

  const stateFilter = useMemo(
    () => resolveCallStateFilter(values?.state, params.state),
    [values?.state, params.state],
  );

  // Everything except state, which is resolved above.
  const filterValues = useMemo(() => {
    const { state: _state, ...rest } = values ?? {};
    return selectProposalPublicCallsFilter(rest);
  }, [values]);

  const filter = useMemo(() => {
    const result: ProposalProtectedCallsListData['query'] = { ...filterValues };
    if (customer) {
      result.customer_uuid = customer.uuid;
    }
    if (stateFilter) {
      result.state = stateFilter as any;
    }
    return result;
  }, [customer, filterValues, stateFilter]);

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
    // The state tabs own `?state`. With URL syncing on, the filter form wrote
    // its own value back over the tab's on every render, so the first tab click
    // stuck and the rest did nothing. The form still filters — it just keeps
    // its selection in memory instead of racing the tabs for the query string.
    syncFiltersToURL: false,
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
              /* The working surface — proposals, reviews, reviewer pool —
                 rather than the configuration form. A manager opening a call
                 from their own list is going to work on it, not to reconfigure
                 it; Edit is one tab away. */
              state="protected-call.manage"
              params={{ call_uuid: row.uuid }}
              label={row.name}
            />
          ),
          copyField: (row) => row.name,
        },
        // Only on the cross-organisation list. On an organisation's own tab
        // every row would name the same organisation.
        ...(scopeToCustomer
          ? []
          : [
              {
                title: translate('Organization'),
                render: ({ row }) =>
                  row.customer_uuid ? (
                    <Link
                      state="call-management.call-list"
                      params={{ uuid: row.customer_uuid }}
                      label={row.customer_name}
                    />
                  ) : (
                    <>{renderFieldOrDash(row.customer_name)}</>
                  ),
                copyField: (row) => row.customer_name || '',
              },
            ]),
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
      hasQuery={true}
      tableActions={<CallCreateButton refetch={tableProps.fetch} />}
      expandableRow={CallExpandableRow}
      filters={<ProposalPublicCallsFilter />}
    />
  );
};
