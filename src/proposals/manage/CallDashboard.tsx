import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import {
  callReviewerPoolsList,
  proposalProposalsList,
  proposalReviewsList,
} from 'waldur-js-client';

import { fetchResultCount } from '@/core/api';
import { FAST_STALE_TIME } from '@/core/constants';
import { StatisticsCard } from '@/core/StatisticsCard';
import { translate } from '@/i18n';

import { Call } from '../types';
import { WorkflowStepsSection } from '../update/workflow-steps/WorkflowStepsSection';

interface CallDashboardProps {
  call: Call;
}

export const CallDashboard: FC<CallDashboardProps> = ({ call }) => {
  // Fetch reviewer pool count (accepted reviewers only)
  const { data: reviewerPoolData } = useQuery({
    queryKey: ['CallDashboard', 'reviewerPool', call.uuid],
    queryFn: () =>
      callReviewerPoolsList({
        query: {
          call_uuid: call.uuid,
          invitation_status: ['accepted'],
          page_size: 1,
        },
      }),
    staleTime: FAST_STALE_TIME,
  });

  // Fetch proposals count
  const { data: proposalsData } = useQuery({
    queryKey: ['CallDashboard', 'proposals', call.uuid],
    queryFn: () =>
      proposalProposalsList({
        query: {
          call_uuid: call.uuid,
          page_size: 1,
        },
      }),
    staleTime: FAST_STALE_TIME,
  });

  // Fetch reviews count
  const { data: reviewsData } = useQuery({
    queryKey: ['CallDashboard', 'reviews', call.uuid],
    queryFn: () =>
      proposalReviewsList({
        query: {
          call_uuid: call.uuid,
          page_size: 1,
        },
      }),
    staleTime: FAST_STALE_TIME,
  });

  const reviewerPoolCount = reviewerPoolData
    ? fetchResultCount(reviewerPoolData)
    : 0;
  const proposalsCount = proposalsData ? fetchResultCount(proposalsData) : 0;
  const reviewsCount = reviewsData ? fetchResultCount(reviewsData) : 0;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-5 mb-5">
        <div>
          <StatisticsCard
            title={translate('Rounds')}
            value={call.rounds?.length || 0}
          />
        </div>
        <div>
          <StatisticsCard
            title={translate('Offerings')}
            value={call.offerings?.length || 0}
          />
        </div>
        <div>
          <StatisticsCard
            title={translate('Reviewer pool')}
            value={reviewerPoolCount}
          />
        </div>
        <div>
          <StatisticsCard
            title={translate('Proposals')}
            value={proposalsCount}
          />
        </div>
        <div>
          <StatisticsCard title={translate('Reviews')} value={reviewsCount} />
        </div>
      </div>
      <WorkflowStepsSection call={call} viewOnly />
    </>
  );
};
