import * as React from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';

const LazyIssueDetails = React.lazy(() =>
  import(/* webpackChunkName: "IssueDetails" */ './IssueDetails').then(
    ({ IssueDetails }) => ({
      default: IssueDetails,
    }),
  ),
);

export const IssueDetailsContainer = props => (
  <React.Suspense fallback={<LoadingSpinner />}>
    <LazyIssueDetails {...props} />
  </React.Suspense>
);
