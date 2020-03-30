import { getAll } from '@waldur/core/api';

import { FEATURE, ICON_CLASS } from './constants';

const getCategories = () => getAll('/marketplace-checklists-categories/');

const getCategoryLink = category =>
  `marketplace-checklist-project({uuid: $ctrl.context.project.uuid, category: '${category.uuid}'})`;

// @ngInject
export default function registerSidebarExtension(SidebarExtensionService) {
  SidebarExtensionService.register('project', () => {
    return getCategories().then(categories => {
      return categories.map((category, index) => ({
        label: category.name,
        icon: ICON_CLASS,
        link: getCategoryLink(category),
        feature: FEATURE,
        index: 220 + index,
      }));
    });
  });
}
