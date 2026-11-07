import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import { omit } from 'es-toolkit';
import { FunctionComponent, useMemo } from 'react';
import {
  proposalPublicCallsList,
  ProposalPublicCallsListData,
  PublicCallStateEnum,
} from 'waldur-js-client';

import { Badge } from 'waldur-ui';

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
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import {
  buildCallTabs,
  resolveCallStateFilter,
  CALL_STATE_VARIANT,
  fetchAllCallCounts,
} from './call-tabs';
import { CallCard } from './CallCard';
import { PublicCallApplyAction } from './details/PublicCallApplyAction';
import { PublicCallExpandableRow } from './PublicCallExpandableRow';
import {
  continuouslyOpenLabel,
  formatRoundCutoff,
  isOpenEnded,
} from './roundCutoff';
import { Call } from './types';
import { formatCallState, getCallStateOptions, getActiveRound } from './utils';

const useCallTabs = (
  offering_uuid: string | undefined,
  provider_uuid: string | undefined,
  enabled: boolean,
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
      return fetchAllCallCounts(proposalPublicCallsList, baseQuery, {
        withDraft: false,
      });
    },
    staleTime: 30_000,
    enabled,
  });

  return useMemo(
    () => (enabled ? buildCallTabs(counts, { withDraft: false }) : undefined),
    [counts, enabled],
  );
};

interface PublicCallsListProps {
  offering_uuid: string;
  provider_uuid?: string;
  initialMode?: 'table' | 'grid';
  /** The card's title; the provider pages keep the default. */
  title?: string;
  /** Leave the title out where a tab above already names the list. */
  hideTitle?: boolean;
  /**
   * Only calls with a round open now. Every such call is active, so the
   * state tabs, the State column and the filters have nothing to narrow.
   */
  openOnly?: boolean;
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
    render: ({ row }) => (
      <>
        {row.rounds?.some(isOpenEnded)
          ? continuouslyOpenLabel()
          : renderFieldOrDash(formatDateTime(row.end_date))}
      </>
    ),
  },
  {
    title: translate('State'),
    render: ({ row }) => (
      <Badge
        variant={CALL_STATE_VARIANT[row.state] || 'secondary'}
        shape="pill"
        tone="outline"
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
      const activeRound = getActiveRound(row);
      return <>{activeRound ? formatRoundCutoff(activeRound) : <>&mdash;</>}</>;
    },
    filter: 'has_active_round',
  },
  {
    title: translate('Duration'),
    render: ({ row }) =>
      row.fixed_duration_in_days ? (
        <Badge variant="blue" shape="pill" tone="outline">
          {translate('Fixed - {n} days', {
            n: row.fixed_duration_in_days,
          })}
        </Badge>
      ) : (
        translate('Standard')
      ),
  },
];

/** The open-calls view: no State column, and nothing to filter inline. */
const OpenCallColumns = CallColumns.filter(
  (column) => column.filter !== 'state',
).map((column) => omit(column, ['filter', 'inlineFilter']));

export const PublicCallsList: FunctionComponent<PublicCallsListProps> = ({
  ...props
}) => {
  const { params } = useCurrentStateAndParams();
  const values = useFilterValues('PublicCallsList');
  const callTabs = useCallTabs(
    props.offering_uuid,
    props.provider_uuid,
    !props.openOnly,
  );

  // State is resolved separately: the tabs and the filter form both write
  // `?state`, in different shapes. See resolveCallStateFilter.
  const filters = useMemo(() => {
    const { state: _state, ...rest } = values ?? {};
    return selectProposalPublicCallsFilter(rest);
  }, [values]);

  const stateFilter = useMemo(
    () => resolveCallStateFilter(values?.state, params.state),
    [values?.state, params.state],
  );

  const filter = useMemo(() => {
    const result: ProposalPublicCallsListData['query'] = props.openOnly
      ? { has_active_round: true }
      : { ...filters };
    if (props.offering_uuid) {
      result.offering_uuid = props.offering_uuid;
    }
    if (props.provider_uuid) {
      result.offerings_provider_uuid = props.provider_uuid;
    }
    // A bookmarked ?state=draft names nothing a public list holds.
    const publicStates = stateFilter?.filter(
      (state): state is PublicCallStateEnum => state !== 'draft',
    );
    if (publicStates?.length && !props.openOnly) {
      result.state = publicStates;
    }
    return result;
  }, [
    filters,
    props.offering_uuid,
    props.provider_uuid,
    props.openOnly,
    stateFilter,
  ]);
  const tableProps = useTable({
    // Its own table, so its search and page do not follow All calls'.
    table: props.openOnly ? 'OpenCallsList' : 'PublicCallsList',
    // The state tabs own `?state`; see resolveCallStateFilter.
    syncFiltersToURL: false,
    fetchData: createFetcher(proposalPublicCallsList),
    filter,
    queryField: 'name',
  });
  return (
    <Table<Call>
      title={props.title ?? translate('Calls for proposals')}
      hideTitle={props.hideTitle}
      {...tableProps}
      tabs={callTabs}
      columns={props.openOnly ? OpenCallColumns : CallColumns}
      initialMode={props.initialMode ? props.initialMode : 'table'}
      gridItem={({ row }) => <CallCard call={row} />}
      gridClassName="lg:grid-cols-2 xl:grid-cols-3"
      hoverShadow={{ grid: false }}
      verboseName={translate('Public calls')}
      initialSorting={{ field: 'name', mode: 'desc' }}
      hasQuery={true}
      expandableRow={PublicCallExpandableRow}
      filters={props.openOnly ? undefined : <ProposalPublicCallsFilter />}
      rowActions={({ row }) => (
        <ActionsDropdown row={row} size="sm">
          <PublicCallApplyAction call={row} />
        </ActionsDropdown>
      )}
      formId={ProposalPublicCallsFilterFormId}
    />
  );
};
