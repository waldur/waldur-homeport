import issuesService from './issues-service';
import issueListModule from './list/module';
import issueRoutes from './routes';
import issueWorkspaceModule from './workspace/module';
import './events';

export default module => {
  module.service('issuesService', issuesService);
  module.config(issueRoutes);
  issueListModule(module);
  issueWorkspaceModule(module);
};
