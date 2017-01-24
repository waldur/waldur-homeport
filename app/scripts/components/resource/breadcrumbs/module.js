import { resourceBreadcrumbs } from './resource-breadcrumbs';
import ResourceBreadcrumbsService from './resource-breadcrumbs-service';
import { CATEGORY_ITEMS } from './resource-categories';

export default module => {
  module.component('resourceBreadcrumbs', resourceBreadcrumbs);
  module.service('ResourceBreadcrumbsService', ResourceBreadcrumbsService);
  module.constant('CATEGORY_ITEMS', CATEGORY_ITEMS);
};
