import { lazy, Suspense } from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';

const CustomerListContainer = lazy(() =>
  import(
    /* webpackChunkName: "CustomerListContainer" */ './CustomerListContainer'
  ).then(({ CustomerListContainer }) => ({
    default: CustomerListContainer,
  })),
);

export const LazyCustomerList = (props) => (
  <Suspense fallback={<LoadingSpinner />}>
    <CustomerListContainer {...props} />
  </Suspense>
);
