import { translate } from '@waldur/i18n';

import { countChecklists, getCategories } from './api';
import { ICON_CLASS } from './constants';
import { Category } from './types';

const getMenuItems = (linkFunction) => async () => {
  const checklistCount = await countChecklists();
  if (checklistCount === 0) {
    return [];
  }
  const categories = await getCategories();
  return categories.map((category, index) => ({
    label: category.name,
    icon: ICON_CLASS,
    ...linkFunction(category),
    index: 220 + index,
  }));
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

export const getMenuForOrganization = async () => {
  const checklistCount = await countChecklists();
  if (checklistCount === 0) {
    return [];
  }

  return {
    label: translate('Checklist setup'),
    state: 'marketplace-checklist-customer',
    icon: ICON_CLASS,
  };
};
