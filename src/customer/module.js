import customerCreateModule from './create/module';
import customerDashboardModule from './dashboard/module';
import customerDetailsModule from './details/module';
import customerPopoverModule from './popover/module';
import customerServicesModule from './services/module';
import customerWorkspaceModule from './workspace/module';
import customerList from './CustomerListContainer';
import routes from './routes';
import './events';

export default module => {
  customerCreateModule(module);
  customerDashboardModule(module);
  customerDetailsModule(module);
  customerPopoverModule(module);
  customerServicesModule(module);
  customerWorkspaceModule(module);
  module.component('customerList', customerList);
  module.config(routes);
};
