import { get } from '@waldur/core/api';
import { getCategories } from '@waldur/marketplace/common/api';
import { Category } from '@waldur/marketplace/types';
import { ExpandableRow } from '@waldur/resource/ResourceExpandableRow';

interface TotalStats {
  price: number;
  total: number;
}

export const getTotal = params =>
  get<TotalStats>('/billing-total-cost/', params).then(
    response => response.data,
  );

const getCustomerCounters = (customerId: string) =>
  get(`/customers/${customerId}/counters/`).then(response => response.data);

const parseCategories = (
  categories: Category[],
  counters: object,
): ExpandableRow[] => {
  return categories
    .map(category => ({
      label: category.title,
      value: counters[`marketplace_category_${category.uuid}`],
    }))
    .filter(row => row.value)
    .sort((a, b) => a.label.localeCompare(b.label));
};

export async function loadCustomerResources(props): Promise<ExpandableRow[]> {
  const categories = await getCategories({
    params: { field: ['uuid', 'title'] },
  });
  const counters = await getCustomerCounters(props.uuid);
  return parseCategories(categories, counters);
}
