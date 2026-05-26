import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent, useMemo } from 'react';
import { Form, useFormState } from 'react-final-form';
import {
  proposalPublicCallsList,
  ProposalPublicCallsListData,
} from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { formatDateTime } from '@/core/dateUtils';
import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import {
  ProposalPublicCallsFilter,
  selectProposalPublicCallsFilter,
  ProposalPublicCallsFilterFormId,
} from '@/table/generated/ProposalPublicCallsFilter';
import Table from '@/table/Table';
import { TableTab } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import {
  buildCallTabs,
  CALL_STATE_VARIANT,
  fetchAllCallCounts,
} from './call-tabs';
import { CallCard } from './CallCard';
import { PublicCallApplyAction } from './details/PublicCallApplyAction';
import { PublicCallExpandableRow } from './PublicCallExpandableRow';
import { Call } from './types';
import {
  formatCallState,
  getCallStateOptions,
  getRoundsWithStatus,
} from './utils';

const useCallTabs = (
  offering_uuid?: string,
  provider_uuid?: string,
): TableTab[] => {
  const { data: counts } = useQuery({
    queryKey: ['callTabCounts', offering_uuid, provider_uuid],
    queryFn: () => {
      const baseQuery: ProposalPublicCallsListData['query'] = {};
      if (offering_uuid) {
        baseQuery.offering_uuid = offering_uuid;
      }
      if (provider_uuid) {
        baseQuery.offerings_provider_uuid = provider_uuid;
      }
      return fetchAllCallCounts(proposalPublicCallsList, baseQuery);
    },
    staleTime: 30_000,
  });

  return useMemo(() => buildCallTabs(counts), [counts]);
};

interface PublicCallsListProps {
  offering_uuid: string;
  provider_uuid?: string;
  initialMode?: 'table' | 'grid';
}

const CallColumns = [
  {
    title: translate('Name'),
    orderField: 'name',
    render: ({ row }) => (
      <Link
        state="public-call.details"
        params={{ call_uuid: row.uuid }}
        label={row.name}
      />
    ),

    copyField: (row) => row.name,
  },
  {
    title: translate('Organization'),
    render: ({ row }) => <>{row.customer_name}</>,
  },
  {
    title: translate('Start'),
    render: ({ row }) => (
      <>{renderFieldOrDash(formatDateTime(row.start_date))}</>
    ),
  },
  {
    title: translate('End'),
    render: ({ row }) => <>{renderFieldOrDash(formatDateTime(row.end_date))}</>,
  },
  {
    title: translate('State'),
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
  {
    title: translate('Active round'),
    render: ({ row }) => {
      const activeRound = useMemo(() => {
        const items = getRoundsWithStatus(row.rounds);
        const first = items[0];
        if (
          first &&
          (first.status.value === 'open' || first.status.value === 'scheduled')
        ) {
          return first;
        }
        return null;
      }, [row.rounds]);
      return (
        <>
          {activeRound ? formatDateTime(activeRound.cutoff_time) : <>&mdash;</>}
        </>
      );
    },
    filter: 'has_active_round',
  },
  {
    title: translate('Duration'),
    render: ({ row }) =>
      row.fixed_duration_in_days ? (
        <Badge variant="blue" pill outline>
          {translate('Fixed - {n} days', {
            n: row.fixed_duration_in_days,
          })}
        </Badge>
      ) : (
        translate('Standard')
      ),
  },
];

const PublicCallsListTable: FunctionComponent<PublicCallsListProps> = (
  props,
) => {
  const { params } = useCurrentStateAndParams();
  const { values } = useFormState();
  const callTabs = useCallTabs(props.offering_uuid, props.provider_uuid);

  const filters = useMemo(
    () => selectProposalPublicCallsFilter(values),
    [values],
  );

  const filter = useMemo(() => {
    const result: ProposalPublicCallsListData['query'] = { ...filters };
    if (props.offering_uuid) {
      result.offering_uuid = props.offering_uuid;
    }
    if (props.provider_uuid) {
      result.offerings_provider_uuid = props.provider_uuid;
    }
    if (params.state) {
      result.state = params.state;
    }
    return result;
  }, [filters, props.offering_uuid, props.provider_uuid, params.state]);
  const tableProps = useTable({
    table: 'PublicCallsList',
    fetchData: createFetcher(proposalPublicCallsList),
    filter,
    queryField: 'name',
  });
  return (
    <Table<Call>
      title={translate('Calls for proposals')}
      {...tableProps}
      tabs={callTabs}
      columns={CallColumns}
      initialMode={props.initialMode ? props.initialMode : 'table'}
      gridItem={({ row }) => <CallCard call={row} />}
      gridSize={{ lg: 6, xl: 4 }}
      hoverShadow={{ grid: false }}
      verboseName={translate('Public calls')}
      initialSorting={{ field: 'name', mode: 'desc' }}
      hasQuery={true}
      expandableRow={PublicCallExpandableRow}
      filters={<ProposalPublicCallsFilter />}
      rowActions={({ row }) => (
        <ActionsDropdown row={row} size="sm">
          <PublicCallApplyAction call={row} />
        </ActionsDropdown>
      )}
      formId={ProposalPublicCallsFilterFormId}
    />
  );
};

export const PublicCallsList = (props) => (
  <Form
    id={ProposalPublicCallsFilterFormId}
    onSubmit={() => {}}
    subscription={{
      values: true,
    }}
  >
    {() => <PublicCallsListTable {...props} />}
  </Form>
);
