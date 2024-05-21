import { translate } from '@waldur/i18n';
import { Category, CategoryGroup, Section } from '@waldur/marketplace/types';

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

export const getCategoryItems = (categories: Category[]) => {
  if (!categories.length) return [];
  const children = categories
    .sort((a, b) => (a.title > b.title ? 1 : b.title > a.title ? -1 : 0))
    .map((category) => ({
      title: `${category.title} (${category.offering_count})`,
      to: 'public.marketplace-category',
      params: { category_uuid: category.uuid },
    }));
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

const SUPPORTED_TYPES = ['choice', 'list', 'boolean'];

export const prepareAttributeSections = (sections: Section[]) =>
  sections
    .map((section) => ({
      ...section,
      attributes: section.attributes.filter(
        (attribute) => SUPPORTED_TYPES.indexOf(attribute.type) !== -1,
      ),
    }))
    .filter((section) => section.attributes.length > 0);
