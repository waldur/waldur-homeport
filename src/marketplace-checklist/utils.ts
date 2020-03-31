import { getCategories } from './api';
import { FEATURE, ICON_CLASS } from './constants';
import { Category } from './types';

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
