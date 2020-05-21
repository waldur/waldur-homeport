import issueAttachmentsModule from './attachments/module';
import issueCommentsModule from './comments/module';
import issueCreateModule from './create/module';
import issuesService from './issues-service';
import issueListModule from './list/module';
import issueRoutes from './routes';
import issueWorkspaceModule from './workspace/module';
import './events';

export default module => {
  module.service('issuesService', issuesService);
  module.config(issueRoutes);
  issueCommentsModule(module);
  issueCreateModule(module);
  issueListModule(module);
  issueWorkspaceModule(module);
  issueAttachmentsModule(module);
};
