import moment from 'moment-timezone';

import { formatDate } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';

const eChartInitialOption = () => ({
  toolbox: {
    feature: {
      saveAsImage: {
        title: translate('Save'),
        name: `components-usage-chart-${formatDate(moment())}`,
        show: true,
      },
    },
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      crossStyle: {
        color: '#999',
      },
    },
    formatter: (params) => {
      const date = params[0].axisValue;
      const value = params[0].data.value;
      const description = params[0].data.description;
      if (!value) {
        return null;
      }
      const tooltip =
        `${translate('Date')}: ${date}` +
        `<br/>${translate('Value')}: ${value}` +
        `${
          description ? `<br/>${translate('Description')}: ${description}` : ''
        }`;
      return `<span>${tooltip}</span>`;
    },
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
      name: '',
      axisLabel: {
        formatter: '{value}',
      },
    },
  ],
  series: [
    {
      type: 'bar',
      data: [],
    },
  ],
});

const setYAxisLabel = (option, unit: string): void => {
  option.yAxis[0].name = unit;
};

// Filters usages by type and the last 12 months period
const filterUsages = (component, usages) =>
  usages.filter((usage) => {
    const twelveMonthsAgo = moment().subtract(12, 'months');
    return (
      twelveMonthsAgo.isBefore(usage.date) &&
      moment().diff(usage.date) >= 0 &&
      usage.type === component.type
    );
  });

const getLastTwelveMonths = (): any[] => {
  const lastTwelveMonths = [];
  for (let i = 11; i >= 0; i--) {
    lastTwelveMonths.push(moment().subtract(i, 'months'));
  }
  return lastTwelveMonths;
};

const fillPeriods = (lastTwelveMonths, option): void => {
  const periods: string[] = [];
  lastTwelveMonths.forEach((period) => {
    const month = period.month() + 1;
    const year = period.year();
    periods.push(`${month} - ${year}`);
  });
  option.xAxis[0].data = periods;
};

const setColor = (option, color: string) => {
  option.series[0].color = color;
};

const fillUsages = (option, periods, usages) => {
  for (let i = 0; i < periods.length; i++) {
    for (let j = 0; j < usages.length; j++) {
      if (
        moment(periods[i]).format('YYYY-MM') ===
        moment(usages[j].date).format('YYYY-MM')
      ) {
        option.series[0].data.push({
          value: usages[j].usage,
          description: usages[j].description,
        });
        break;
      }
      if (j === usages.length - 1) {
        option.series[0].data.push(0);
      }
    }
  }
};

export const getEChartOptions = (
  component,
  usages,
  colors: string[],
  index: number,
) => {
  const option = eChartInitialOption();
  setYAxisLabel(option, component.measured_unit);
  setColor(option, colors[index]);
  const lastTwelveMonths = getLastTwelveMonths();
  fillPeriods(lastTwelveMonths, option);
  usages = filterUsages(component, usages);
  if (!usages.length) {
    return option;
  }
  fillUsages(option, lastTwelveMonths, usages);
  return option;
};
