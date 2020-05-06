import * as React from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';

const LazyCalendar = React.lazy(() =>
  import(/* webpackChunkName: "fullcalendar" */ './LazyCalendar').then(
    ({ LazyCalendar }) => ({
      default: LazyCalendar,
    }),
  ),
);

export const Calendar = props => (
  <React.Suspense fallback={<LoadingSpinner />}>
    <LazyCalendar {...props} />
  </React.Suspense>
);
