import { isEmpty } from 'lodash';

import { getScopeChartOptions } from '@waldur/dashboard/chart';
import { getEventStats } from '@waldur/events/api';
import { translate } from '@waldur/i18n';
import { getUserChecklistScore } from '@waldur/marketplace-checklist/api';
import { User, UserDetails } from '@waldur/workspace/types';

import { USER_PROFILE_COMPLETION_FIELDS } from '../constants';

export async function loadCharts(user: User, hasChecklists: boolean) {
  const eventStats = (
    await getEventStats({
      scope: user.url,
      page_size: 12,
    })
  ).reverse();
  const dates = eventStats.map((row) =>
    translate('{count} user events in {date}', {
      count: row.count,
      date: `${row.month}-${row.year}`,
    }),
  );
  const values = eventStats.map((row) => row.count);
  const events = {
    chart: getScopeChartOptions(dates, values),
    title: translate('User events (month)'),
    current: eventStats[eventStats.length - 1].count,
  };
  if (hasChecklists) {
    const checklists = await getUserChecklistScore(user.uuid);
    return { events, checklists };
  } else {
    return { events };
  }
}

export function calculateProfileCompletionPercentage(
  user: UserDetails,
  completionFields: Array<keyof UserDetails> = USER_PROFILE_COMPLETION_FIELDS,
) {
  if (!user) return 0;
  let completionValue = 0;
  for (const key of completionFields) {
    if (!isEmpty(user[key])) completionValue++;
  }
  return Math.round((completionValue / completionFields.length) * 100);
}
