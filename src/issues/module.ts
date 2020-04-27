import issueAttachmentsModule from './attachments/module';
import issueCommentsModule from './comments/module';
import issueCreateModule from './create/module';
import issueDetail from './issue-detail';
import issuesService from './issues-service';
import issueListModule from './list/module';
import requestServiceButton from './request-service-button';
import issueRoutes from './routes';
import issueTypesModule from './types/module';
import issueWorkspaceModule from './workspace/module';
import './events';

export default module => {
  module.service('issuesService', issuesService);
  module.component('issueDetail', issueDetail);
  module.component('requestServiceButton', requestServiceButton);
  module.config(issueRoutes);
  issueTypesModule(module);
  issueCommentsModule(module);
  issueCreateModule(module);
  issueListModule(module);
  issueWorkspaceModule(module);
  issueAttachmentsModule(module);
};
