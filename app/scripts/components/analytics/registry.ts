import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';

import * as constants from './constants';

export const registeredQuotas = {
  ram: {
    get label() { return translate('Batch RAM usage'); },
    formatter: formatFilesize,
    valueType: constants.valueType.byte,
    minFileSizeName: 'MB',
    formatterTemplatePie: fileSizeName => item =>
      `${item.seriesName}<br />
      ${item.marker}${item.name}: ${formatFilesize(item.value, 'MB', fileSizeName)}`,
    formatterTemplateBar: fileSizeName => ([usage, limit]) =>
      `${usage.axisValue}<br />
      ${usage.marker}${usage.seriesName}: ${usage.value} ${fileSizeName}<br />
      ${limit.marker}${limit.seriesName}: ${limit.value} ${fileSizeName}`,
  },
  volumes: {
    get label() { return translate('Volume count'); },
    valueType: constants.valueType.unit,
  },
  snapshots: {
    get label() { return translate('Snapshot size'); },
    formatter: formatFilesize,
    valueType: constants.valueType.byte,
    minFileSizeName: 'MB',
    formatterTemplatePie: fileSizeName => item =>
      `${item.seriesName}<br />
      ${item.marker}${item.name}: ${formatFilesize(item.value, 'MB', fileSizeName)}`,
    formatterTemplateBar: fileSizeName => ([usage, limit]) =>
      `${usage.axisValue}<br />
      ${usage.marker}${usage.seriesName}: ${usage.value} ${fileSizeName}<br />
      ${limit.marker}${limit.seriesName}: ${limit.value} ${fileSizeName}`,
  },
};

export const getRegisteredQuota = (quotaName: string) => registeredQuotas[quotaName];
