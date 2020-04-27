import { connectAngularComponent } from '@waldur/store/connect';

import BreadcrumbsService from './breadcrumbs-service';
import { BreadcrumbsContainer } from './BreadcrumbsContainer';

export default module => {
  module.component(
    'breadcrumbsContainer',
    connectAngularComponent(BreadcrumbsContainer),
  );
  module.service('BreadcrumbsService', BreadcrumbsService);
};
