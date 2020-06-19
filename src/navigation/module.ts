import headerModule from './header/module';
import workspaceModule from './workspace/module';

export default module => {
  headerModule(module);
  workspaceModule(module);
};
