import { connectAngularComponent } from '@waldur/store/connect';

import { AppFooter } from './AppFooter';
import breadcrumbsModule from './breadcrumbs/module';
import cookiesModule from './cookies/module';
import headerModule from './header/module';
import NavigationUtilsService from './navigation-utils-service';
import setTitleFromState from './set-title-from-state';
import sidebarModule from './sidebar/module';
import titleService from './title-service';
import workspaceModule from './workspace/module';

export default module => {
  module.service('NavigationUtilsService', NavigationUtilsService);
  module.service('titleService', titleService);
  module.run(setTitleFromState);
  module.component('appFooter', connectAngularComponent(AppFooter));
  breadcrumbsModule(module);
  cookiesModule(module);
  headerModule(module);
  sidebarModule(module);
  workspaceModule(module);
};
