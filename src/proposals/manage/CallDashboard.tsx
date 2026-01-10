import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { Col, Row } from 'react-bootstrap';
import {
  callReviewerPoolsList,
  proposalProposalsList,
  proposalReviewsList,
} from 'waldur-js-client';

import { StatisticsCard } from '@waldur/core/StatisticsCard';
import { translate } from '@waldur/i18n';

import { Call } from '../types';

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
    staleTime: 30000,
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
    staleTime: 30000,
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
    staleTime: 30000,
  });

  const reviewerPoolCount = parseInt(
    reviewerPoolData?.response?.headers?.get('x-result-count') ?? '0',
    10,
  );
  const proposalsCount = parseInt(
    proposalsData?.response?.headers?.get('x-result-count') ?? '0',
    10,
  );
  const reviewsCount = parseInt(
    reviewsData?.response?.headers?.get('x-result-count') ?? '0',
    10,
  );

  return (
    <Row className="mb-6">
      <Col md={6} lg={3}>
        <StatisticsCard
          title={translate('Rounds')}
          value={call.rounds?.length || 0}
        />
      </Col>
      <Col md={6} lg={3}>
        <StatisticsCard
          title={translate('Offerings')}
          value={call.offerings?.length || 0}
        />
      </Col>
      <Col md={6} lg={3}>
        <StatisticsCard
          title={translate('Reviewer pool')}
          value={reviewerPoolCount}
        />
      </Col>
      <Col md={6} lg={3}>
        <StatisticsCard title={translate('Proposals')} value={proposalsCount} />
      </Col>
      <Col md={6} lg={3}>
        <StatisticsCard title={translate('Reviews')} value={reviewsCount} />
      </Col>
    </Row>
  );
};
