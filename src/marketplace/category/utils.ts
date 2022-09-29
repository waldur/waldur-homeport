import { translate } from '@waldur/i18n';
import { Category, Section } from '@waldur/marketplace/types';

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

export const getCategoryItems = (
  categories: Category[],
  categoryRouteState: string,
) => {
  if (!categories.length) return [];
  const children = categories
    .sort((a, b) => (a.title > b.title ? 1 : b.title > a.title ? -1 : 0))
    .map((category) => ({
      title: `${category.title} (${category.offering_count})`,
      to: categoryRouteState,
      params: { category_uuid: category.uuid },
    }));
  return [
    {
      title: translate('Categories'),
      children,
    },
  ];
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
