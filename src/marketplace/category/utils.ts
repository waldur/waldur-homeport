import { translate } from '@waldur/i18n';
import { Category, CategoryGroup } from '@waldur/marketplace/types';

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
  const totalOfferingCount = categories.reduce(
    (sum, category) => sum + category.offering_count,
    0,
  );
  const children: CategoryItem[] = categories
    .sort((a, b) => (a.title > b.title ? 1 : b.title > a.title ? -1 : 0))
    .map((category) => ({
      title: `${category.title}`,
      to: 'public.marketplace-category',
      params: { category_uuid: category.uuid },
    }));

  children.unshift({
    title: `${translate('All offerings')} (${totalOfferingCount})`,
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
