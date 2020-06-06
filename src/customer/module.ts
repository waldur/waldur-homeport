import customerDetailsModule from './details/module';
import customerServicesModule from './services/module';
import customerTeamModule from './team/module';
import customerWorkspaceModule from './workspace/module';
import './events';

export default module => {
  customerTeamModule(module);
  customerDetailsModule(module);
  customerServicesModule(module);
  customerWorkspaceModule(module);
};
