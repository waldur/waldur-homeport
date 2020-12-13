import { lazyComponent } from '@waldur/core/lazyComponent';

export const Calendar = lazyComponent(
  () => import(/* webpackChunkName: "LazyCalendar" */ './LazyCalendar'),
  'LazyCalendar',
);
