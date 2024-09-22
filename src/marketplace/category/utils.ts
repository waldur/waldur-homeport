import { useDispatch } from 'react-redux';
import { useAsync } from 'react-use';

import { translate } from '@waldur/i18n';
import {
  Category,
  CategoryColumn,
  CategoryGroup,
} from '@waldur/marketplace/types';
import { closeModalDialog } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import {
  createCategoryColumn,
  getCategoryColumns,
  updateCategoryColumn,
} from './admin/api';

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
      } else {
        Object.assign(categoryGroup, { categories: [category] });
        Object.assign(categoryGroup, {
          offering_count: category.offering_count,
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

async function loadData(categoryUUID: string) {
  const params = { category_uuid: categoryUUID };
  const columns = await getCategoryColumns(params);
  return { columns };
}

export const useCategoryColumnsEditor = (category: Category) => {
  const asyncState = useAsync(() => loadData(category.uuid), [category.uuid]);
  const dispatch = useDispatch();

  const submitRequest = async (formData: FormData) => {
    try {
      const columnRequests = formData.columns.map((column: CategoryColumn) => {
        if (column.uuid) {
          return updateCategoryColumn(column.uuid, column);
        } else {
          return createCategoryColumn({ ...column, category: category.url });
        }
      });

      await Promise.all(columnRequests);

      dispatch(
        showSuccess(
          translate('Category columns have been successfully saved.'),
        ),
      );

      dispatch(closeModalDialog());
    } catch (e) {
      dispatch(
        showErrorResponse(
          e,
          translate('Unable to save category columns. Please try again.'),
        ),
      );
    }
  };

  const initialValues = asyncState.value
    ? { columns: asyncState.value.columns }
    : { columns: [] };

  return {
    asyncState,
    submitRequest,
    category: category,
    initialValues,
    dispatch,
  };
};
