import { useDispatch } from 'react-redux';
import { useAsync } from 'react-use';
import {
  CategoryColumn,
  CategoryColumnRequest,
  marketplaceCategoryColumnsCreate,
  marketplaceCategoryColumnsList,
  marketplaceCategoryColumnsUpdate,
} from 'waldur-js-client';

import { getAllPages, MAX_PAGE_SIZE } from '@/core/api';
import { translate } from '@/i18n';
import { Category, CategoryGroup } from '@/marketplace/types';
import { useManagedMutation } from '@/modal/useManagedMutation';

export const countSelectedFilters = (filterValues) => {
  const selectedFilters = [];
  if (filterValues) {
    Object.keys(filterValues).forEach((value) => {
      const fieldKey = value.split('-')[1];
      if (selectedFilters.indexOf(fieldKey) === -1) {
        selectedFilters.push(fieldKey);
      }
    });
  }
  return selectedFilters.length;
};

export const countSelectedFilterValues = (filterValues, key) => {
  let counter = 0;
  if (filterValues) {
    Object.keys(filterValues).forEach((value) => {
      const filterName = value.split('-')[1];
      if (filterName === key) {
        counter += 1;
      }
    });
  }
  return counter;
};

interface CategoryItem {
  title: string;
  to: string;
  params?: { category_uuid?: string; initialMode?: string };
}

export const getCategoryItems = (categories: Category[]) => {
  if (!categories.length) return [];
  const children: CategoryItem[] = categories
    .sort((a, b) => (a.title > b.title ? 1 : b.title > a.title ? -1 : 0))
    .map((category) => ({
      title: category.title,
      to: 'public.marketplace-category',
      params: { category_uuid: category.uuid },
    }));

  children.unshift({
    title: translate('All offerings'),
    to: 'public.offerings',
    params: { initialMode: 'table' },
  });

  return [
    {
      title: translate('Offerings'),
      children,
    },
  ];
};

export const getGroupedCategories = (
  categories: Category[],
  categoryGroups: CategoryGroup[],
): CategoryGroup[] => {
  return categories.reduce((acc, category) => {
    const categoryGroup = categoryGroups?.find(
      (group) => category.group === group.url,
    );
    if (categoryGroup) {
      const existGroup = acc.find((item) => item.uuid === categoryGroup.uuid);
      if (existGroup) {
        existGroup.categories.push(category);
        existGroup.offering_count += category.offering_count;
        existGroup.resource_count += category.resource_count;
      } else {
        Object.assign(categoryGroup, { categories: [category] });
        Object.assign(categoryGroup, {
          offering_count: category.offering_count,
          resource_count: category.resource_count,
        });
        acc.push(categoryGroup);
      }
    } else {
      acc.push(category);
    }
    return acc;
  }, []);
};

interface FormData {
  columns: CategoryColumn[];
}

export const useCategoryColumnsEditor = (category: Category) => {
  const asyncState = useAsync(
    () =>
      getAllPages((page) =>
        marketplaceCategoryColumnsList({
          query: {
            page,
            page_size: MAX_PAGE_SIZE,
            category_uuid: category.uuid,
          },
        }),
      ),
    [category.uuid],
  );
  const dispatch = useDispatch();

  const submitMutation = useManagedMutation<any, any, FormData>({
    mutationFn: async (formData) => {
      const columnRequests = formData.columns.map((column: CategoryColumn) => {
        if (column.uuid) {
          return marketplaceCategoryColumnsUpdate({
            path: { uuid: column.uuid },
            body: column as CategoryColumnRequest,
          });
        } else {
          return marketplaceCategoryColumnsCreate({
            body: { ...column, category: category.url },
          });
        }
      });

      await Promise.all(columnRequests);
    },
    successMessage: translate('Category columns have been successfully saved.'),
    errorMessage: translate(
      'Unable to save category columns. Please try again.',
    ),
  });

  const submitRequest = (values: FormData) =>
    submitMutation.mutateAsync(values);

  const initialValues = { columns: asyncState.value || [] };

  return {
    asyncState,
    submitRequest,
    category: category,
    initialValues,
    dispatch,
  };
};
