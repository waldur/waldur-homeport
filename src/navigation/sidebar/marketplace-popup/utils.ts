import { groupBy } from 'lodash';

import { getAllOfferings, getCategories } from '@waldur/marketplace/common/api';
import { Category } from '@waldur/marketplace/types';
import { Customer } from '@waldur/workspace/types';

export const fetchCategories = async (
  customer: Customer,
  offering_name = '',
) => {
  return await getCategories({
    params: {
      allowed_customer_uuid: customer.uuid,
      field: ['uuid', 'title', 'offering_count', 'icon'],
      has_offerings: true,
      offering_name,
    },
  });
};

export const fetchOfferings = async (
  customer: Customer,
  category: Category,
  search: string,
) => {
  const offerings = await getAllOfferings({
    params: {
      allowed_customer_uuid: customer.uuid,
      category_uuid: category.uuid,
      name: search,
      field: [
        'uuid',
        'category_uuid',
        'customer_uuid',
        'category_title',
        'name',
        'description',
        'image',
        'state',
        'paused_reason',
      ],
      state: ['Active', 'Paused'],
    },
  });
  if (!offerings) return {};
  else return groupBy(offerings, 'category_uuid');
};
