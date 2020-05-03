import { connectAngularComponent } from '@waldur/store/connect';

import { AppHeader } from './AppHeader';
import siteHeader from './site-header';

export default module => {
  module.component('siteHeader', siteHeader);
  module.component('ncHeader', connectAngularComponent(AppHeader));
};
