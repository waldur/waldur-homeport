import { useCurrentStateAndParams } from '@uirouter/react';
import { FC } from 'react';

import { AssignmentBatchesSection } from '@/proposals/assignments/AssignmentBatchesSection';
import { ReviewerCapacitySection } from '@/proposals/assignments/ReviewerCapacitySection';
import { Call } from '@/proposals/types';

import { ReviewerDiscoverySection } from '../../manage/reviewer-discovery';
import { COIReviewSection } from '../coi-review/COIReviewSection';

import { ReviewerPoolSection } from './ReviewerPoolSection';

interface ReviewerPoolContainerProps {
  call: Call;
  refetch: () => void;
}

const tabs = {
  pool: ReviewerPoolSection,
  discovery: ReviewerDiscoverySection,
  assignment_batches: AssignmentBatchesSection,
  reviewer_capacity: ReviewerCapacitySection,
  coi: COIReviewSection,
};

const DEFAULT_TAB = 'pool';

export const ReviewerPoolContainer: FC<ReviewerPoolContainerProps> = ({
  call,
  refetch,
}) => {
  const { params } = useCurrentStateAndParams();

  // Get active tab from URL or default to 'pool'
  const activeTab = (params.pool_tab as keyof typeof tabs) || DEFAULT_TAB;
  const ActiveComponent = tabs[activeTab] || tabs[DEFAULT_TAB];

  return <ActiveComponent call={call} refetch={refetch} />;
};
