import { lazy, Suspense } from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';

const LazyCalendar = lazy(() =>
  import(/* webpackChunkName: "fullcalendar" */ './LazyCalendar').then(
    ({ LazyCalendar }) => ({
      default: LazyCalendar,
    }),
  ),
);

export const Calendar = (props) => (
  <Suspense fallback={<LoadingSpinner />}>
    <LazyCalendar {...props} />
  </Suspense>
);
