import { customersList, invoicesImportUsage } from 'waldur-js-client';
import type { ImportUsageRequest, ImportUsageResponse } from 'waldur-js-client';

import { CustomerLookup } from './types';

export const importComponentUsage = async (
  data: ImportUsageRequest,
): Promise<ImportUsageResponse> => {
  const response = await invoicesImportUsage({ body: data });
  return response.data;
};

export const fetchAllCustomers = async (): Promise<CustomerLookup[]> => {
  const customers: CustomerLookup[] = [];
  let page = 1;
  const pageSize = 200;
  let hasMore = true;

  while (hasMore) {
    const response = await customersList({
      query: {
        field: ['uuid', 'name'],
        page,
        page_size: pageSize,
      },
    });

    customers.push(
      ...response.data.map((c) => ({
        uuid: c.uuid,
        name: c.name,
      })),
    );

    // Check if there are more pages
    const totalCount = parseInt(
      response.response.headers.get('x-result-count') || '0',
      10,
    );
    hasMore = customers.length < totalCount;
    page++;
  }

  return customers;
};
