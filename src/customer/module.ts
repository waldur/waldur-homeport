import customerCreateModule from './create/module';
import customerDetailsModule from './details/module';
import customerServicesModule from './services/module';
import customerTeamModule from './team/module';
import customerWorkspaceModule from './workspace/module';
import './events';

export default module => {
  customerTeamModule(module);
  customerCreateModule(module);
  customerDetailsModule(module);
  customerServicesModule(module);
  customerWorkspaceModule(module);
};
