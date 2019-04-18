import { get } from '@waldur/core/api';
import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';
import { getCategories } from '@waldur/marketplace/common/api';
import { Category } from '@waldur/marketplace/types';
import { ExpandableRow } from '@waldur/resource/ResourceExpandableRow';

export const getTotal = params =>
  get('/billing-total-cost/', params).then(response => response.data);

const getCustomerCounters = (customerId: string) =>
  get(`/customers/${customerId}/counters/`).then(response => response.data);

const getQuotaRows = props => {
  const counters = props.quotas.reduce((acc, quota) => ({
    ...acc,
    [quota.name]: quota.usage,
  }));
  return [
    {
      label: translate('VMs'),
      value: counters.nc_vm_count,
      visible: true,
    },
    {
      label: translate('Storage'),
      value: counters.nc_storage_count,
      visible: true,
    },
    {
      label: translate('Private clouds'),
      value: counters.nc_private_cloud_count,
      visible: true,
    },
    {
      label: translate('Allocations'),
      value: counters.nc_allocation_count,
      visible: isFeatureVisible('slurm'),
    },
    {
      label: translate('Requests'),
      value: counters.nc_offering_count,
      visible: isFeatureVisible('offering'),
    },
  ].filter(row => row.visible).filter(row => row.value);
};

const parseCategories = (categories: Category[], counters: object): ExpandableRow[] => {
  return categories.map(category => ({
    label: category.title,
    value: counters[`marketplace_category_${category.uuid}`],
  })).filter(row => row.value).sort((a, b) => a.label.localeCompare(b.label));
};

export async function loadCustomerResources(props): Promise<ExpandableRow[]> {
  if (!isFeatureVisible('marketplace')) {
    return getQuotaRows(props);
  } else {
    const categories = await getCategories({params: {field: ['uuid', 'title']}});
    const counters = await getCustomerCounters(props.uuid);
    return parseCategories(categories, counters);
  }
}
