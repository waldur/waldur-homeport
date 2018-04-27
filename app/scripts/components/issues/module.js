import issuesService from './issues-service';
import issueDetail from './issue-detail';
import issueRoutes from './routes';
import issueAttachmentsModule from './attachments/module';
import issueCommentsModule from './comments/module';
import issueCreateModule from './create/module';
import issueListModule from './list/module';
import issueTypesModule from './types/module';
import issueWorkspaceModule from './workspace/module';
import requestServiceButton from './request-service-button';
import registerExtensionPoint from './extend-appstore-selector';
import './events';

export default module => {
  module.service('issuesService', issuesService);
  module.component('issueDetail', issueDetail);
  module.component('requestServiceButton', requestServiceButton);
  module.config(issueRoutes);
  module.run(registerExtensionPoint);
  issueTypesModule(module);
  issueCommentsModule(module);
  issueCreateModule(module);
  issueListModule(module);
  issueWorkspaceModule(module);
  issueAttachmentsModule(module);
};
