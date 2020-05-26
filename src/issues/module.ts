import issueListModule from './list/module';
import issueRoutes from './routes';
import issueWorkspaceModule from './workspace/module';
import './events';

export default module => {
  module.config(issueRoutes);
  issueListModule(module);
  issueWorkspaceModule(module);
};
