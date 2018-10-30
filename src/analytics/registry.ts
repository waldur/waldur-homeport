import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';

import * as constants from './constants';

const getFilesizeQuota = label => ({
  label,
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
});

const getCountQuota = label => ({
  label,
  valueType: constants.valueType.unit,
});

export const getRegisteredQuota = (quotaName: string) => ({
  vcpu: getCountQuota(translate('vCPU count')),
  ram: getFilesizeQuota(translate('RAM size')),
  storage: getFilesizeQuota(translate('Block storage size')),
  floating_ip_count: getCountQuota(translate('Floating IP count')),
  instances: getCountQuota(translate('Instance count')),
  volumes_size: getFilesizeQuota(translate('Volume size')),
  snapshots_size: getFilesizeQuota(translate('Snapshot size')),
  volumes: getCountQuota(translate('Block volume count')),
  snapshots: getCountQuota(translate('Block snapshot count')),
}[quotaName]);
