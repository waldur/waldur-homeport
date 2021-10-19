import { DateTime } from 'luxon';

import { PeriodOption } from '@waldur/form/types';
import { UsersService } from '@waldur/user/UsersService';

export function checkPermission() {
  return UsersService.getCurrentUser().then((user) => {
    if (!user.is_staff && !user.is_support) {
      return Promise.reject();
    }
  });
}

export const getStartAndEndDatesOfMonth = (period: PeriodOption) => {
  const { year, month } = period;
  const dt = DateTime.fromObject({ year, month });
  return {
    start: dt.startOf('month').toISODate(),
    end: dt.endOf('month').toISODate(),
  };
};
