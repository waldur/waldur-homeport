import { lazy, Suspense } from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';

const LazyCalendarComponent = lazy(() =>
  import('./LazyCalendarComponent').then(({ LazyCalendarComponent }) => ({
    default: LazyCalendarComponent,
  })),
);

export const CalendarComponent = (props) => (
  <Suspense fallback={<LoadingSpinner />}>
    <LazyCalendarComponent {...props} />
  </Suspense>
);
