import { getAll } from '@waldur/core/api';

import { FEATURE, ICON_CLASS } from './constants';

interface Category {
  name: string;
  uuid: string;
}

const getCategories = () =>
  getAll<Category>('/marketplace-checklists-categories/');

const getMenuItems = linkFunction => () => {
  return getCategories().then(categories => {
    return categories.map((category, index) => ({
      label: category.name,
      icon: ICON_CLASS,
      link: linkFunction(category),
      feature: FEATURE,
      index: 220 + index,
    }));
  });
};

export const getMenuForProject = getMenuItems(
  (category: Category) =>
    `marketplace-checklist-project({uuid: $ctrl.context.project.uuid, category: '${category.uuid}'})`,
);

export const getMenuForSupport = getMenuItems(
  (category: Category) =>
    `marketplace-checklist-overview({category: '${category.uuid}'})`,
);
