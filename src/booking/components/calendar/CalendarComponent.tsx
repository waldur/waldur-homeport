import { lazyComponent } from '@waldur/core/lazyComponent';

export const CalendarComponent = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "LazyCalendarComponent" */ './LazyCalendarComponent'
    ),
  'LazyCalendarComponent',
);
