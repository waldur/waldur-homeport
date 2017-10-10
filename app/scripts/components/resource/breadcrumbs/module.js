import ResourceBreadcrumbsService from './resource-breadcrumbs-service';
import { CATEGORY_ITEMS } from './resource-categories';

export default module => {
  module.service('ResourceBreadcrumbsService', ResourceBreadcrumbsService);
  module.constant('CATEGORY_ITEMS', CATEGORY_ITEMS);
};
