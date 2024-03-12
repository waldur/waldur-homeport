import { defaultCurrency } from '@waldur/core/formatCurrency';
import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';

import { QuotaChoice } from './types';

export const getQuotas = (hidden: boolean): QuotaChoice[] => [
  {
    key: 'nc_resource_count',
    title: translate('Resources'),
  },
  {
    key: 'estimated_price',
    title: translate('Esimated price per month'),
    tooltipValueFormatter: (value) => defaultCurrency(value),
    hidden,
  },
  {
    key: 'vpc_cpu_count',
    title: translate('VPC vCPU'),
  },
  {
    key: 'vpc_ram_size',
    title: translate('VPC RAM'),
    tooltipValueFormatter: formatFilesize,
  },
  {
    key: 'vpc_storage_size',
    title: translate('VPC block storage size'),
    tooltipValueFormatter: formatFilesize,
  },
  {
    key: 'vpc_floating_ip_count',
    title: translate('VPC floating IP count'),
  },
  {
    key: 'vpc_instance_count',
    title: translate('VPC instance count'),
  },
  {
    key: 'os_cpu_count',
    title: translate('Cloud vCPU'),
  },
  {
    key: 'os_ram_size',
    title: translate('Cloud RAM'),
    tooltipValueFormatter: formatFilesize,
  },
  {
    key: 'os_storage_size',
    title: translate('Cloud block storage size'),
    tooltipValueFormatter: formatFilesize,
  },
];
