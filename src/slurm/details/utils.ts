import { DateTime } from 'luxon';

import { translate } from '@waldur/i18n';
import { getComponentUsages } from '@waldur/marketplace/common/api';
import { getChartSpec, palette } from '@waldur/slurm/details/constants';

import { getAllocationUserUsages } from './api';
import { MeasureUnit, Period, Usage, UserUsage } from './types';

const eChartInitialOption = (measureUnit?: MeasureUnit) => ({
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
        formatter: '{value} ' + measureUnit === 'minute' ? 'm' : 'h',
      },
    },
    {
      type: 'value',
      name: '',
      axisLabel: {
        formatter: '{value} ' + measureUnit === 'minute' ? 'm' : 'h',
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

const getLast24Months = (): string[] => {
  const last24Months: string[] = [];
  for (let i = 23; i >= 0; i--) {
    const date = DateTime.now().minus({ months: i });
    last24Months.push(`${date.month} - ${date.year}`);
  }
  return last24Months;
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

const fillUsages = (
  option,
  periods: Period[],
  usages: Usage[],
  chart,
  measureUnit?: MeasureUnit,
) => {
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
        usageValue =
          measureUnit === 'minute'
            ? usageValue
            : convertMinuteToHour(usageValue);
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

const filterUsagesBy24MonthsPeriod = (usages: Usage[]): Usage[] =>
  usages.filter((usage) => {
    const _24MonthsAgo = DateTime.now().minus({ months: 24 });
    const usageDate = DateTime.fromObject({
      day: 1,
      month: usage.month,
      year: usage.year,
    });
    return _24MonthsAgo <= usageDate && usageDate <= DateTime.now();
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
  measureUnit?: MeasureUnit,
) => {
  const option = eChartInitialOption(measureUnit || 'hour');

  // filling periods
  option.xAxis[0].data = getLast24Months();
  const periods = getPeriods(option.xAxis[0].data);

  usages = filterUsagesBy24MonthsPeriod(usages);
  setUnitForRamUsage(option, chart);
  fillUsages(option, periods, usages, chart, measureUnit || 'hour');
  fillSeriesAndLegendWithDistinctUsers(option, userUsages);
  fillUserUsages(option, periods, userUsages, chart);

  return option;
};

export const loadCharts = async (
  allocationUrl: string,
  resourceUuid: string,
) => {
  if (!allocationUrl || !resourceUuid) {
    return;
  }
  const componentUsages = await getComponentUsages(resourceUuid);
  const periodUsages = {};
  componentUsages.forEach((component) => {
    const period = DateTime.fromISO(component.billing_period).toFormat(
      'yyyy-MM',
    );
    periodUsages[period] = periodUsages[period] || {};
    periodUsages[period][component.type] = component.usage;
  });
  const usages: Usage[] = Object.keys(periodUsages).map((period) => {
    const date = DateTime.fromFormat(period, 'yyyy-MM');
    return {
      year: date.year,
      month: date.month,
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
    options: getEChartOptions(chart, usages, userUsages, 'minute'),
  }));
};
