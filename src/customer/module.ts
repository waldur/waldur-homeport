import customerTeamModule from './team/module';
import customerWorkspaceModule from './workspace/module';
import './events';

export default (module) => {
  customerTeamModule(module);
  customerWorkspaceModule(module);
};
