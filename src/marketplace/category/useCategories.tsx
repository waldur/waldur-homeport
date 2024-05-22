import { useQuery } from '@tanstack/react-query';

import {
  getCategories,
  getCategoryGroups,
} from '@waldur/marketplace/common/api';
import { CategoryGroup } from '@waldur/marketplace/types';

import { getGroupedCategories } from './utils';

export const useCategories = () =>
  useQuery<any, any, CategoryGroup[]>(
    ['useCategories'],
    () =>
      Promise.all([
        getCategoryGroups(),
        getCategories({
          params: {
            field: ['uuid', 'icon', 'title', 'offering_count', 'group'],
          },
        }),
      ]).then(([categoryGroups, categories]) =>
        getGroupedCategories(categories, categoryGroups),
      ),
    {
      staleTime: 1 * 60 * 1000,
    },
  );
