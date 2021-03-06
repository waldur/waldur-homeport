import moment from 'moment';

import { translate } from '@waldur/i18n';
import { getComponentUsages } from '@waldur/marketplace/common/api';
import { getChartSpec, palette } from '@waldur/slurm/details/constants';

import { getAllocationUserUsages } from './api';
import { Period, Usage, UserUsage } from './types';

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
      axisLabel: {
        formatter: '{value} h',
      },
    },
    {
      type: 'value',
      name: '',
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

const getDistinctUsers = (userUsages: UserUsage[]): UserUsage[] => {
  const distinctUsers: UserUsage[] = [];
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
  parseFloat((mb / 1024).toFixed(2));

const convertMinuteToHour = (minutes: number): number =>
  parseFloat((minutes / 60).toFixed(2));

const setUnitForRamUsage = (option, chart) => {
  if (chart.field === 'ram_usage') {
    option.yAxis[0].axisLabel.formatter = option.yAxis[1].axisLabel.formatter =
      '{value} GB-hours';
  }
};

const fillUsages = (option, periods: Period[], usages: Usage[], chart) => {
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

const fillSeriesAndLegendWithDistinctUsers = (
  option,
  userUsages: UserUsage[],
) => {
  const distinctUsers = getDistinctUsers(userUsages);
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

export const getEChartOptions = (
  chart,
  usages: Usage[],
  userUsages: UserUsage[],
) => {
  const option = eChartInitialOption();

  // filling periods
  option.xAxis[0].data = getLastSixMonths();
  const periods = getPeriods(option.xAxis[0].data);

  usages = filterUsagesBySixMonthsPeriod(usages);
  setUnitForRamUsage(option, chart);
  fillUsages(option, periods, usages, chart);
  fillSeriesAndLegendWithDistinctUsers(option, userUsages);
  fillUserUsages(option, periods, userUsages, chart);

  return option;
};

export const loadCharts = async (
  allocationUrl: string,
  resourceUuid: string,
) => {
  const componentUsages = await getComponentUsages(resourceUuid);
  const periodUsages = {};
  componentUsages.forEach((component) => {
    const period = moment(component.billing_period).format('YYYY-MM');
    periodUsages[period] = periodUsages[period] || {};
    periodUsages[period][component.type] = component.usage;
  });
  const usages: Usage[] = Object.keys(periodUsages).map((period) => {
    const date = moment(period, 'YYYY-MM');
    return {
      year: date.year(),
      month: date.month() + 1,
      cpu_usage: periodUsages[period].cpu,
      gpu_usage: periodUsages[period].gpu,
      ram_usage: periodUsages[period].ram,
    };
  });
  const userUsages = await getAllocationUserUsages({
    allocation: allocationUrl,
  });
  return getChartSpec().map((chart) => ({
    ...chart,
    options: getEChartOptions(chart, usages, userUsages),
  }));
};
