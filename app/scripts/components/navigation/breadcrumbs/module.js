import breadcrumbs from './breadcrumbs';
import breadcrumbsContainer from './breadcrumbs-container';
import BreadcrumbsService from './breadcrumbs-service';

export default module => {
  module.component('breadcrumbs', breadcrumbs);
  module.component('breadcrumbsContainer', breadcrumbsContainer);
  module.service('BreadcrumbsService', BreadcrumbsService);
};
