import { parseResultCount } from '@waldur/core/api';
import { getOfferingsByServiceProvider } from '@waldur/marketplace/common/api';
import { ANONYMOUS_CONFIG } from '@waldur/table/api';

export const fetchOfferings = async (keyword: string, pageIndex: number) => {
  if (!keyword) {
    return [];
  }
  const response = await getOfferingsByServiceProvider({
    ...ANONYMOUS_CONFIG,
    params: {
      keyword,
      page: pageIndex,
      page_size: 3,
      shared: true,
      billable: true,
      state: 'Active',
    },
  });
  return {
    items: Array.isArray(response.data) ? response.data : [],
    totalItems: parseResultCount(response),
  };
};
