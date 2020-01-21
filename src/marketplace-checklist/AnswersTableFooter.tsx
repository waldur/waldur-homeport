import * as React from 'react';

import { EChart } from '@waldur/core/EChart';
import { translate } from '@waldur/i18n';

const getChartData = answers => ({
  toolbox: {
    show: true,
    showTitle: false,
    feature: {
      saveAsImage: true,
    },
  },
  series: [
    {
      type: 'pie',
      radius: ['50%', '70%'],
      label: {
        show: true,
        formatter: '{b}: {c}',
      },
      data: [
        {
          name: translate('Positive'),
          value: Object.keys(answers).filter(a => answers[a] === true).length,
        },
        {
          name: translate('Negative'),
          value: Object.keys(answers).filter(a => answers[a] === false).length,
        },
        {
          name: translate('Unknown'),
          value: Object.keys(answers).filter(a => answers[a] === null).length,
        },
      ],
    },
  ],
});

export const AnswersTableFooter = ({ answers }) => (
  <tfoot>
    <tr>
      <td colSpan={3}>
        <EChart options={getChartData(answers)} height="300px" />
      </td>
    </tr>
  </tfoot>
);
