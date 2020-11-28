import moment from 'moment-timezone';

import { translate } from '@waldur/i18n';
import { palette } from '@waldur/slurm/details/constants';

export interface Period {
  month: number;
  year: number;
}

interface Usage extends Period {
  username: string;
  full_name: string;
  cpu_usage: number;
  gpu_usage: number;
  ram_usage: number;
}

const eChartInitialOption = () => ({
  color: palette,
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      crossStyle: {
        color: '#999',
      },
    },
  },
  legend: {
    data: [translate('Usage')],
  },
  xAxis: [
    {
      type: 'category',
      data: [],
      axisPointer: {
        type: 'shadow',
      },
    },
  ],
  yAxis: [
    {
      type: 'value',
      name: translate('Usage'),
      min: 0,
      max: null,
      interval: null,
      axisLabel: {
        formatter: '{value} h',
      },
    },
    {
      type: 'value',
      name: '',
      min: 0,
      max: null,
      interval: null,
      axisLabel: {
        formatter: '{value} h',
      },
    },
  ],
  series: [
    {
      name: translate('Usage'),
      type: 'line',
      yAxisIndex: 1,
      data: [],
    },
  ],
});

const getDistinctUsers = (userUsages: Usage[]): Usage[] => {
  const distinctUsers: Usage[] = [];
  const map = new Map();
  for (const item of userUsages) {
    if (!map.has(item.username)) {
      map.set(item.username, true);
      distinctUsers.push(item);
    }
  }
  return distinctUsers;
};

const getLastSixMonths = (): string[] => {
  const lastSixMonths: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const date = moment().subtract(i, 'months');
    const month = date.month() + 1;
    const year = date.year();
    lastSixMonths.push(`${month} - ${year}`);
  }
  return lastSixMonths;
};

export const getPeriods = (xAxisPeriods: string[]): Period[] => {
  const periods: Period[] = [];
  xAxisPeriods.forEach((period) => {
    periods.push({
      month: parseInt(period.split(' - ')[0]),
      year: parseInt(period.split(' - ')[1]),
    });
  });
  return periods;
};

const convertMBToGB = (mb: number): number =>
  parseFloat((mb / 1000).toFixed(2));

const convertMinuteToHour = (minutes: number): number =>
  parseFloat((minutes / 60).toFixed(2));

const setMaxAndAverageUsages = (option, usages, chart) => {
  let maxUsage = Math.max(...usages.map((usage) => usage[chart.field]));
  let averageUsage =
    usages.reduce((total, next) => total + next[chart.field], 0) /
    usages.length;

  if (chart.field === 'ram_usage') {
    maxUsage = convertMBToGB(maxUsage);
    averageUsage = convertMBToGB(averageUsage);
  }

  maxUsage = convertMinuteToHour(maxUsage);
  averageUsage = convertMinuteToHour(averageUsage);

  option.yAxis[0].max = option.yAxis[1].max = Math.ceil(
    maxUsage + averageUsage / 3,
  );
  option.yAxis[0].interval = option.yAxis[1].interval = averageUsage;
};

const setUnitForRamUsage = (option, chart) => {
  if (chart.field === 'ram_usage') {
    option.yAxis[0].axisLabel.formatter = option.yAxis[1].axisLabel.formatter =
      '{value} GB-hours';
  }
};

const fillUsages = (option, periods, usages, chart) => {
  // filling data of line chart (general usages)
  for (let i = 0; i < periods.length; i++) {
    for (let j = 0; j < usages.length; j++) {
      if (
        periods[i].month === usages[j].month &&
        periods[i].year === usages[j].year
      ) {
        let usageValue = usages[j][chart.field];
        if (chart.field === 'ram_usage') {
          usageValue = convertMBToGB(usageValue);
        }
        usageValue = convertMinuteToHour(usageValue);
        option.series[0].data.push(usageValue);
        break;
      }
      if (j === usages.length - 1) {
        option.series[0].data.push(0);
      }
    }
  }
};

const fillUserUsages = (option, periods, userUsages, chart) => {
  // filling data arrays of specific users
  for (let i = 1; i < option.series.length; i++) {
    for (let j = 0; j < periods.length; j++) {
      for (let k = 0; k < userUsages.length; k++) {
        if (
          option.series[i].name === userUsages[k].username &&
          periods[j].month === userUsages[k].month &&
          periods[j].year === userUsages[k].year
        ) {
          let usageValue = userUsages[k][chart.field];
          if (chart.field === 'ram_usage') {
            usageValue = convertMBToGB(usageValue);
          }
          usageValue = convertMinuteToHour(usageValue);
          option.series[i].data.push(usageValue);
          break;
        }
        if (k === userUsages.length - 1) {
          option.series[i].data.push(0);
        }
      }
    }
  }
};

const filterUsagesBySixMonthsPeriod = (usages: Usage[]): Usage[] =>
  usages.filter((usage) => {
    const sixMonthsAgo = moment().subtract(6, 'months');
    const usageDate = moment()
      .date(1)
      .month(usage.month - 1)
      .year(usage.year);
    return sixMonthsAgo <= usageDate && usageDate <= moment();
  });

const fillSeriesAndLegendWithDistinctUsers = (option, userUsages) => {
  const distinctUsers: any = getDistinctUsers(userUsages);
  distinctUsers.forEach((user) => {
    option.series.push({
      name: user.username,
      type: 'bar',
      data: [],
      yAxisIndex: 0,
    });
    option.legend.data.push(user.username);
  });
};

export const getEChartOptions = (chart, usages, userUsages) => {
  const option = eChartInitialOption();

  // filling periods
  option.xAxis[0].data = getLastSixMonths();
  const periods = getPeriods(option.xAxis[0].data);

  usages = filterUsagesBySixMonthsPeriod(usages);
  setMaxAndAverageUsages(option, usages, chart);
  setUnitForRamUsage(option, chart);
  fillUsages(option, periods, usages, chart);
  fillSeriesAndLegendWithDistinctUsers(option, userUsages);
  fillUserUsages(option, periods, userUsages, chart);

  return option;
};
