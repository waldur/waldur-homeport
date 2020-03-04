import * as React from 'react';

import { EChart } from '@waldur/core/EChart';
import { translate } from '@waldur/i18n';

export const PieChart = ({ positive, negative, unknown }) => {
  const options = React.useMemo(
    () => ({
      legend: {
        orient: 'vertical',
        left: 0,
        data: [
          translate('Positive'),
          translate('Negative'),
          translate('Unknown'),
        ],
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
      },
      series: [
        {
          type: 'pie',
          radius: ['50%', '70%'],
          label: false,
          data: [
            {
              name: translate('Positive'),
              value: positive,
              itemStyle: { color: '#1ab394' },
            },
            {
              name: translate('Negative'),
              value: negative,
              itemStyle: { color: '#ED5565' },
            },
            {
              name: translate('Unknown'),
              value: unknown,
              itemStyle: { color: '#c2c2c2' },
            },
          ],
        },
      ],
    }),
    [positive, negative, unknown],
  );
  return <EChart options={options} height="300px" />;
};
