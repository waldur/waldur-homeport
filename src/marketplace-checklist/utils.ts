import store from '@waldur/store/store';
import { getProject } from '@waldur/workspace/selectors';

import { getCategories } from './api';
import { FEATURE, ICON_CLASS } from './constants';
import { Category } from './types';

const getMenuItems = linkFunction => () => {
  return getCategories().then(categories => {
    return categories.map((category, index) => ({
      label: category.name,
      icon: ICON_CLASS,
      ...linkFunction(category),
      feature: FEATURE,
      index: 220 + index,
    }));
  });
};

export const getMenuForProject = async () => {
  const project = getProject(store.getState());
  const items = await getMenuItems((category: Category) => ({
    state: 'marketplace-checklist-project',
    params: {
      uuid: project.uuid,
      category: category.uuid,
    },
  }))();
  return items;
};

export const getMenuForSupport = getMenuItems((category: Category) => ({
  state: 'marketplace-checklist-overview',
  params: { category: category.uuid },
}));
