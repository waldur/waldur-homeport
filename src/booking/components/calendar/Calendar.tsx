import { OptionsInput } from '@fullcalendar/core';

import { lazyComponent } from '@waldur/core/lazyComponent';

export const Calendar = lazyComponent<OptionsInput>(
  () => import(/* webpackChunkName: "LazyCalendar" */ './LazyCalendar'),
  'LazyCalendar',
);
