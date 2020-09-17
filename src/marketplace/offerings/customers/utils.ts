import * as moment from 'moment-timezone';

import { formatDate } from '@waldur/core/dateUtils';
import { ENV } from '@waldur/core/services';
import { translate } from '@waldur/i18n';

export const formatOfferingCostsChart = (offeringCostsChartData) => {
  const name = translate('Cost');
  return {
    toolbox: {
      feature: {
        saveAsImage: {
          title: translate('Save'),
          name: `offering-costs-chart-${formatDate(moment())}`,
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
    },
    xAxis: [
      {
        type: 'category',
        axisPointer: {
          type: 'shadow',
        },
        data: offeringCostsChartData.map((row) => row.period),
      },
    ],
    yAxis: [
      {
        type: 'value',
        name,
        min: 0,
        max: null,
        interval: null,
        axisLabel: {
          formatter: `${ENV.currency}{value}`,
        },
      },
    ],
    legend: {
      data: [name],
    },
    series: [
      {
        name,
        type: 'line',
        data: offeringCostsChartData.map((row) =>
          ENV.accountingMode === 'accounting' ? row.price : row.total,
        ),
      },
    ],
  };
};
