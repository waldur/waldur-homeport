import customerCreateModule from './create/module';
import customerDetailsModule from './details/module';
import customerPopoverModule from './popover/module';
import routes from './routes';
import customerServicesModule from './services/module';
import customerTeamModule from './team/module';
import customerWorkspaceModule from './workspace/module';
import './events';

export default module => {
  customerCreateModule(module);
  customerDetailsModule(module);
  customerPopoverModule(module);
  customerServicesModule(module);
  customerWorkspaceModule(module);
  module.config(routes);
};
