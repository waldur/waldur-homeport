import { useQuery } from '@tanstack/react-query';
import { callManagingOrganisationsStatsRetrieve } from 'waldur-js-client';

import { STALE_TIME } from '@/core/constants';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { StatisticsCard } from '@/core/StatisticsCard';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { CallState } from '@/proposals/types';
import {
  getProposalStateOptions,
  getReviewStateOptions,
} from '@/proposals/utils';
import { useCustomer } from '@/workspace/hooks';

const FlatStatistics = ({ count, title }) => {
  return (
    <div className="flex-1 md:text-center mb-3">
      <strong className="block text-xl">{count}</strong>
      <strong className="health-title">{title}</strong>
    </div>
  );
};

// The call list's state tabs own `?state` and expect a bare value, unlike the
// proposal/review lists whose URL-synced filter forms store option objects.
const getCallState = (state: CallState) => ({
  state: 'call-management.call-list',
  params: { state },
});

const getProposalState = (states: string[]) => ({
  state: 'call-management.proposal-list',
  params: {
    state: JSON.stringify(
      states.map((state) =>
        getProposalStateOptions().find((op) => op.value === state),
      ),
    ),
  },
});

const getReviewState = (states: string[]) => ({
  state: 'call-management.review-list',
  params: {
    state: JSON.stringify(
      states.map((state) =>
        getReviewStateOptions().find((op) => op.value === state),
      ),
    ),
  },
});

export const CallManagementDashboard = () => {
  const customer = useCustomer();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [
      'call-management-dashboard',
      customer.call_managing_organization_uuid,
    ],

    queryFn: () =>
      callManagingOrganisationsStatsRetrieve({
        path: { uuid: customer.call_managing_organization_uuid },
      }).then((response) => response.data),

    staleTime: STALE_TIME,
  });

  const callOnly = isFeatureVisible(MarketplaceFeatures.call_only);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-5">
      {error && (
        <LoadingErred
          message={translate('Unable to load statistics data')}
          loadData={refetch}
          className="mb-3 col-span-full"
        />
      )}
      {data && (
        <>
          <div>
            <StatisticsCard
              title={translate('Open calls')}
              value={data.open_calls}
              to={getCallState('active')}
            />
          </div>
          {callOnly ? null : (
            <>
              <div>
                <StatisticsCard
                  title={translate('Accepted proposals')}
                  value={data.accepted_proposals}
                  to={getProposalState(['accepted'])}
                />
              </div>
              <div>
                <StatisticsCard
                  title={translate('Pending proposals')}
                  value={data.pending_proposals}
                  to={getProposalState(['in_review', 'submitted'])}
                />
              </div>
              <div>
                <StatisticsCard
                  title={translate('Pending reviews')}
                  value={data.pending_review}
                  to={getReviewState(['submitted'])}
                />
              </div>
            </>
          )}
          <div className={callOnly ? 'lg:col-span-3' : 'col-span-full'}>
            <div className="card card-bordered mb-5">
              <div className="card-body">
                <div className="flex justify-start lg:justify-between flex-wrap">
                  <FlatStatistics
                    title={translate('Active rounds')}
                    count={data.active_rounds}
                  />

                  <FlatStatistics
                    title={translate('Round closing soon')}
                    count={data.rounds_closing_in_one_week}
                  />

                  <FlatStatistics
                    title={translate('Calls closing soon')}
                    count={data.calls_closing_in_one_week}
                  />

                  <FlatStatistics
                    title={translate('Pending offering requests')}
                    count={data.offering_requests_pending}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {isLoading && (
        <div>
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
};
