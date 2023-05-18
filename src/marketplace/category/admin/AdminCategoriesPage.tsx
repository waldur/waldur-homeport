import { FunctionComponent } from 'react';
import { useAsync } from 'react-use';

import { getCategories } from '@waldur/marketplace/common/api';
import { Category } from '@waldur/marketplace/types';

import { CategoriesList } from '../list/CategoriesList';

export const AdminCategoriesPage: FunctionComponent = () => {
  const {
    loading: loadingCategories,
    error: errorCategories,
    value: categories,
  } = useAsync<Category[]>(() => getCategories(), []);

  return (
    <CategoriesList
      items={categories}
      loading={loadingCategories}
      loaded={!errorCategories}
    />
  );
};
