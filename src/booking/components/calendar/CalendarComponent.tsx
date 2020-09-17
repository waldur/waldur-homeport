import * as React from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';

const LazyCalendarComponent = React.lazy(() =>
  import('./LazyCalendarComponent').then(({ LazyCalendarComponent }) => ({
    default: LazyCalendarComponent,
  })),
);

export const CalendarComponent = (props) => (
  <React.Suspense fallback={<LoadingSpinner />}>
    <LazyCalendarComponent {...props} />
  </React.Suspense>
);
