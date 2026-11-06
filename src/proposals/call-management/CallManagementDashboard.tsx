import { useQuery } from '@tanstack/react-query';
import { callManagingOrganisationsStatsRetrieve } from 'waldur-js-client';

import { StatCardGrid } from 'waldur-ui';

import { STALE_TIME } from '@/core/constants';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { CallState } from '@/proposals/types';
import {
  getProposalStateOptions,
  getReviewStateOptions,
} from '@/proposals/utils';
import { useCustomer } from '@/workspace/hooks';

// The call list's state tabs own `?state` and expect a bare value, unlike the
// proposal/review lists whose URL-synced filter forms store option objects.
const getCallState = (state: CallState) => ({
  to: 'call-management.call-list',
  params: { state },
});

const getProposalState = (states: string[]) => ({
  to: 'call-management.proposal-list',
  params: {
    state: JSON.stringify(
      states.map((state) =>
        getProposalStateOptions().find((op) => op.value === state),
      ),
    ),
  },
});

const getReviewState = (states: string[]) => ({
  to: 'call-management.review-list',
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

  if (isLoading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return (
      <LoadingErred
        message={translate('Unable to load statistics data')}
        loadData={refetch}
        className="mb-3"
      />
    );
  }
  if (!data) {
    return null;
  }

  const openCalls = {
    label: translate('Open calls'),
    value: data.open_calls,
    link: getCallState('active'),
  };
  // What is coming up across the calls: read at a glance, with no list behind
  // each figure.
  const timeline = [
    { label: translate('Active rounds'), value: data.active_rounds },
    {
      label: translate('Round closing soon'),
      value: data.rounds_closing_in_one_week,
    },
    {
      label: translate('Calls closing soon'),
      value: data.calls_closing_in_one_week,
    },
    {
      label: translate('Pending offering requests'),
      value: data.offering_requests_pending,
    },
  ];

  // Without proposals there is one figure with a list behind it, so it joins
  // the timeline in a single row.
  if (callOnly) {
    return <StatCardGrid stats={[openCalls, ...timeline]} />;
  }
  return (
    <>
      <StatCardGrid
        stats={[
          openCalls,
          {
            label: translate('Accepted proposals'),
            value: data.accepted_proposals,
            link: getProposalState(['accepted']),
          },
          {
            label: translate('Pending proposals'),
            value: data.pending_proposals,
            link: getProposalState(['in_review', 'submitted']),
          },
          {
            label: translate('Pending reviews'),
            value: data.pending_review,
            link: getReviewState(['submitted']),
          },
        ]}
      />
      <StatCardGrid stats={timeline} />
    </>
  );
};
