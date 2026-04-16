import { customersList } from 'waldur-js-client';

import { getAllPages } from '@waldur/core/api';

import { CustomerLookup } from './types';

export const fetchAllCustomers = () =>
  getAllPages((page) =>
    customersList({
      query: {
        field: ['uuid', 'name'],
        page,
        page_size: 200,
      },
    }),
  ) as Promise<CustomerLookup[]>;
