import { lazyComponent } from '@waldur/core/lazyComponent';

import type { CalendarComponentProps } from './LazyCalendarComponent';

export const CalendarComponent = lazyComponent<CalendarComponentProps>(
  () =>
    import(
      /* webpackChunkName: "LazyCalendarComponent" */ './LazyCalendarComponent'
    ),
  'LazyCalendarComponent',
);
