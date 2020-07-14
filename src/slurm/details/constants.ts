import { translate } from '@waldur/i18n';

export const getChartSpec = () => [
  {
    name: translate('CPU usage'),
    field: 'cpu_usage',
    factor: 60,
  },
  {
    name: translate('GPU usage'),
    field: 'gpu_usage',
    factor: 60,
  },
  {
    name: translate('RAM usage'),
    field: 'ram_usage',
    factor: 1024,
  },
];

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
