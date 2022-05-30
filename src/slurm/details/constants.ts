import { translate } from '@waldur/i18n';

import { ChartSpec } from './types';

export const getChartSpec = () =>
  [
    {
      name: translate('CPU usage'),
      field: 'cpu_usage',
      units: translate('hours'),
    },
    {
      name: translate('GPU usage'),
      field: 'gpu_usage',
      units: translate('hours'),
    },
    {
      name: translate('RAM usage'),
      field: 'ram_usage',
      units: translate('GB-hours'),
    },
  ] as ChartSpec[];

export const palette = [
  '#003366',
  '#006699',
  '#23c6c8',
  '#eee8d5',
  '#1c84c6',
  'green',
  'red',
  'orange',
  'yellow',
  'purple',
  'aqua',
  'pink',
];
