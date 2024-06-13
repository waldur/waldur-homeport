import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { ENV } from '@waldur/configs/default';
import { formatDateTime } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { LandingHeroSection } from '@waldur/dashboard/hero/LandingHeroSection';
import { translate } from '@waldur/i18n';
import { useFullPage } from '@waldur/navigation/context';
import { CallAllFiltersWithDefaultState } from '@waldur/proposals/call-management/CallAllFilters';
import { CALL_FILTER_FORM_ID } from '@waldur/proposals/constants';
import { Call } from '@waldur/proposals/types';
import { createFetcher, Table } from '@waldur/table';
import { renderFieldOrDash, useTable } from '@waldur/table/utils';

import { CallCard } from './CallCard';
import background from './proposal-calls.png';
import { PublicCallExpandableRow } from './PublicCallExpandableRow';
import { formatCallState, getRoundsWithStatus } from './utils';

const mapStateToFilter = createSelector(
  getFormValues(CALL_FILTER_FORM_ID),
  (filters: any) => {
    const result: Record<string, any> = {};
    if (filters) {
      if (filters.state) {
        result.state = filters.state.map((option) => option.value);
      }
      if (filters.has_active_round) {
        result.has_active_round = filters.has_active_round;
      }
    }
    return result;
  },
);

export const PublicCallsPage: FunctionComponent = () => {
  const filter = useSelector(mapStateToFilter);
  const {
    params: { offering_uuid },
  } = useCurrentStateAndParams();
  useFullPage();

  const tableProps = useTable({
    table: 'PublicCallsList',
    fetchData: createFetcher('proposal-public-calls', {
      params: { ...filter, offering_uuid: offering_uuid },
    }),
    queryField: 'name',
  });

  return (
    <>
      <LandingHeroSection
        header={ENV.plugins.WALDUR_CORE.SHORT_PAGE_TITLE}
        title={translate('Calls for proposals')}
        backgroundImage={background}
      />
      <div className="container-fluid mt-20 mb-10">
        <Table<Call>
          title={translate('Calls for proposals')}
          {...tableProps}
          columns={[
            {
              title: translate('Name'),
              orderField: 'name',
              render: ({ row }) => (
                <Link
                  state="public-calls.details"
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
              render: ({ row }) => (
                <>{renderFieldOrDash(formatDateTime(row.end_date))}</>
              ),
            },
            {
              title: translate('State'),
              render: ({ row }) => <>{formatCallState(row.state)}</>,
            },
            {
              title: translate('Active round'),
              render: ({ row }) => {
                const activeRound = useMemo(() => {
                  const items = getRoundsWithStatus(row.rounds);
                  const first = items[0];
                  if (
                    first &&
                    (first.status.value === 'open' ||
                      first.status.value === 'scheduled')
                  ) {
                    return first;
                  }
                  return null;
                }, [row.rounds]);
                return (
                  <>
                    {activeRound ? (
                      formatDateTime(activeRound.cutoff_time)
                    ) : (
                      <>&mdash;</>
                    )}
                  </>
                );
              },
            },
          ]}
          gridItem={({ row }) => <CallCard call={row} />}
          gridSize={{ lg: 6, xl: 4 }}
          verboseName={translate('Public calls')}
          initialSorting={{ field: 'name', mode: 'desc' }}
          hasQuery={true}
          expandableRow={PublicCallExpandableRow}
          filters={<CallAllFiltersWithDefaultState />}
        />
      </div>
    </>
  );
};
