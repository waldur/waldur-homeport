import { translate } from '@waldur/i18n';

import { getCategories } from './api';
import { FEATURE, ICON_CLASS } from './constants';
import { Category } from './types';

const getMenuItems = (linkFunction) => () => {
  return getCategories().then((categories) => {
    return categories.map((category, index) => ({
      label: category.name,
      icon: ICON_CLASS,
      ...linkFunction(category),
      feature: FEATURE,
      index: 220 + index,
    }));
  });
};

export const getMenuForUser = async () => {
  const items = await getMenuItems((category: Category) => ({
    state: 'marketplace-checklist-user',
    params: {
      category: category.uuid,
    },
  }))();
  return items;
};

export const getMenuForSupport = getMenuItems((category: Category) => ({
  state: 'marketplace-checklist-overview',
  params: { category: category.uuid },
}));

export const getMenuForOrganization = () => ({
  label: translate('Checklist setup'),
  state: 'marketplace-checklist-customer',
  icon: ICON_CLASS,
  feature: FEATURE,
});
