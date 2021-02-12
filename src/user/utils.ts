import { getScopeChartOptions } from '@waldur/dashboard/chart';
import { translate } from '@waldur/i18n';

export const formatUserMonthlyActivityChart = (userMonthlyActivityData) => {
  const dates = userMonthlyActivityData.map((row) =>
    translate('{count} user events in {date}', {
      count: row.count,
      date: `${row.month}-${row.year}`,
    }),
  );
  const values = userMonthlyActivityData.map((row) => row.count);
  return {
    chart: getScopeChartOptions(dates, values),
    title: translate('User events this month'),
    current: userMonthlyActivityData[userMonthlyActivityData.length - 2].count,
  };
};
