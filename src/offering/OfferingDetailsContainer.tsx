import * as React from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';

const LazyOfferingDetails = React.lazy(() =>
  import(/* webpackChunkName: "OfferingDetails" */ './OfferingDetails').then(
    ({ OfferingDetails }) => ({
      default: OfferingDetails,
    }),
  ),
);

export const OfferingDetailsContainer = props => (
  <React.Suspense fallback={<LoadingSpinner />}>
    <LazyOfferingDetails {...props} />
  </React.Suspense>
);
