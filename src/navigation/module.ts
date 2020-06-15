import headerModule from './header/module';
import NavigationUtilsService from './navigation-utils-service';
import workspaceModule from './workspace/module';

export default module => {
  module.service('NavigationUtilsService', NavigationUtilsService);
  headerModule(module);
  workspaceModule(module);
};
