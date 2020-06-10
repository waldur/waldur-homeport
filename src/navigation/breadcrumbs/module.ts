import { connectAngularComponent } from '@waldur/store/connect';

import { BreadcrumbsContainer } from './BreadcrumbsContainer';

export default module => {
  module.component(
    'breadcrumbsContainer',
    connectAngularComponent(BreadcrumbsContainer),
  );
};
