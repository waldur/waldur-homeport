import { lazy, Suspense } from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';

const LazyOfferingDetails = lazy(() =>
  import(/* webpackChunkName: "OfferingDetails" */ './OfferingDetails').then(
    ({ OfferingDetails }) => ({
      default: OfferingDetails,
    }),
  ),
);

export const OfferingDetailsContainer = (props) => (
  <Suspense fallback={<LoadingSpinner />}>
    <LazyOfferingDetails {...props} />
  </Suspense>
);
