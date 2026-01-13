import { useQuery } from '@tanstack/react-query';
import { marketplaceCategoriesList } from 'waldur-js-client';

import { getAllPages, MAX_PAGE_SIZE } from '@waldur/core/api';

export const useOfferingCategories = () => {
  const { data: categories } = useQuery({
    queryKey: ['ResourcesMenu', 'Categories'],

    queryFn: () =>
      getAllPages((page) =>
        marketplaceCategoriesList({
          query: {
            page,
            page_size: MAX_PAGE_SIZE,
            field: ['uuid', 'title', 'group'],
          },
        }),
      ),

    refetchOnWindowFocus: false,
  });
  return categories;
};
