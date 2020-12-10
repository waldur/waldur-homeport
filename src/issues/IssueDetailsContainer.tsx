import { lazy, Suspense } from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';

const LazyIssueDetails = lazy(() =>
  import(/* webpackChunkName: "IssueDetails" */ './IssueDetails').then(
    ({ IssueDetails }) => ({
      default: IssueDetails,
    }),
  ),
);

export const IssueDetailsContainer = (props) => (
  <Suspense fallback={<LoadingSpinner />}>
    <LazyIssueDetails {...props} />
  </Suspense>
);
