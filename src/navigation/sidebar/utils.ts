import { useQuery } from '@tanstack/react-query';
import { marketplaceCategoriesList } from 'waldur-js-client';

import { getAllPages } from '@waldur/core/api';

export const useOfferingCategories = () => {
  const { data: categories } = useQuery({
    queryKey: ['ResourcesMenu', 'Categories'],

    queryFn: () =>
      getAllPages((page) =>
        marketplaceCategoriesList({
          query: {
            page,
            field: ['uuid', 'title', 'group'],
          },
        }),
      ),

    refetchOnWindowFocus: false,
  });
  return categories;
};
