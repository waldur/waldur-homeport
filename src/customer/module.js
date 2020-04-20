import customerCreateModule from './create/module';
import customerList from './CustomerListContainer';
import customerDashboardModule from './dashboard/module';
import customerDetailsModule from './details/module';
import customerPopoverModule from './popover/module';
import routes from './routes';
import customerServicesModule from './services/module';
import customerTeamModule from './team/module';
import customerWorkspaceModule from './workspace/module';
import './events';

export default module => {
  customerCreateModule(module);
  customerDashboardModule(module);
  customerDetailsModule(module);
  customerPopoverModule(module);
  customerServicesModule(module);
  customerWorkspaceModule(module);
  customerTeamModule(module);
  module.component('customerList', customerList);
  module.config(routes);
};
