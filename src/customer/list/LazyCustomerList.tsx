import * as React from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';

const CustomerListContainer = React.lazy(() =>
  import(
    /* webpackChunkName: "CustomerListContainer" */ './CustomerListContainer'
  ).then(({ CustomerListContainer }) => ({
    default: CustomerListContainer,
  })),
);

export const LazyCustomerList = props => (
  <React.Suspense fallback={<LoadingSpinner />}>
    <CustomerListContainer {...props} />
  </React.Suspense>
);
