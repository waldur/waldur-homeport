import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';

import { formatDateTime } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { createFetcher, Table } from '@waldur/table';
import { renderFieldOrDash, useTable } from '@waldur/table/utils';

import { CallAllFiltersWithDefaultState } from './call-management/CallAllFilters';
import { CallCard } from './CallCard';
import { CALL_FILTER_FORM_ID } from './constants';
import { PublicCallApplyButton } from './details/PublicCallApplyButton';
import { PublicCallExpandableRow } from './PublicCallExpandableRow';
import { Call } from './types';
import { formatCallState, getRoundsWithStatus } from './utils';

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
    render: ({ row }) => <>{formatCallState(row.state)}</>,
    filter: 'state',
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
];

export const PublicCallsList: FunctionComponent<PublicCallsListProps> = (
  props,
) => {
  const usePublicCallsFilter = (
    offering_uuid?: string,
    provider_uuid?: string,
  ) => {
    const filters = useSelector(getFormValues(CALL_FILTER_FORM_ID)) as any;

    return useMemo(() => {
      const result: Record<string, any> = {};
      if (filters) {
        if (filters.state) {
          result.state = filters.state.map((option) => option.value);
        }
        if (filters.has_active_round) {
          result.has_active_round = filters.has_active_round;
        }
      }
      if (offering_uuid) {
        result.offering_uuid = offering_uuid;
      }
      if (provider_uuid) {
        result.offerings_provider_uuid = provider_uuid;
      }
      return result;
    }, [filters, offering_uuid, provider_uuid]);
  };
  const filter = usePublicCallsFilter(props.offering_uuid, props.provider_uuid);
  const tableProps = useTable({
    table: 'PublicCallsList',
    fetchData: createFetcher('proposal-public-calls'),
    filter,
    queryField: 'name',
  });
  return (
    <Table<Call>
      title={translate('Calls for proposals')}
      {...tableProps}
      columns={CallColumns}
      initialMode={props.initialMode ? props.initialMode : 'table'}
      gridItem={({ row }) => <CallCard call={row} />}
      gridSize={{ lg: 6, xl: 4 }}
      verboseName={translate('Public calls')}
      initialSorting={{ field: 'name', mode: 'desc' }}
      hasQuery={true}
      expandableRow={PublicCallExpandableRow}
      filters={<CallAllFiltersWithDefaultState />}
      hoverableRow={({ row }) => (
        <PublicCallApplyButton
          call={row}
          title={translate('Apply')}
          variant="flush"
          className="text-btn"
        />
      )}
    />
  );
};
