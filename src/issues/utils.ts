import moment from 'moment-timezone';

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
  const dt = moment({ year, month: month - 1 });
  return {
    start: dt.startOf('month').format('YYYY-MM-DD'),
    end: dt.endOf('month').format('YYYY-MM-DD'),
  };
};
