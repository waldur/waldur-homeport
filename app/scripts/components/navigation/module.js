import titleService from './title-service';
import setTitleFromState from './set-title-from-state';
import uiSrefActiveIf from './ui-sref-active-if';
import { appFooter } from './app-footer';
import breadcrumbsModule from './breadcrumbs/module';
import cookiesModule from './cookies/module';
import headerModule from './header/module';
import sidebarModule from './sidebar/module';
import workspaceModule from './workspace/module';
import NavigationUtilsService from './navigation-utils-service';

export default module => {
  module.service('NavigationUtilsService', NavigationUtilsService);
  module.service('titleService', titleService);
  module.run(setTitleFromState);
  module.directive('uiSrefActiveIf', uiSrefActiveIf);
  module.component('appFooter', appFooter);
  breadcrumbsModule(module);
  cookiesModule(module);
  headerModule(module);
  sidebarModule(module);
  workspaceModule(module);
};
