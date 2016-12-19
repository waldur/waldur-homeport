import issuesService from './issues-service';
import issueUsersService from './issue-users';
import issueCommentsService from './issue-comments-service';
import issueDetail from './issue-detail';
import issueCommentsList from './issue-comments-list';
import issueCommentsForm from './issue-comments-form';
import issuesList from './issues-list';
import issueRoutes from './routes';
import issuesWorkspace from './issues-workspace';
import issuesDashboard from './issues-dashboard';
import issuesShortList from './issues-short-list';
import issueQuickCreate from './issue-quick-create';
import issuesActivityStream from './issues-activity-stream';
import issuesListFiltered from './issues-list-filtered';
import issuesHelpdesk from './issues-helpdesk';
import issueCreateDialog from './issue-create-dialog';
import issueRegistration from './issue-registration';

export default module => {
  module.service('issuesService', issuesService);
  module.service('issueUsersService', issueUsersService);
  module.service('issueCommentsService', issueCommentsService);
  module.directive('issuesList', issuesList);
  module.directive('issueDetail', issueDetail);
  module.directive('issueCommentsList', issueCommentsList);
  module.directive('issueCommentsForm', issueCommentsForm);
  module.directive('issuesWorkspace', issuesWorkspace);
  module.directive('issuesDashboard', issuesDashboard);
  module.directive('issuesShortList', issuesShortList);
  module.directive('issueQuickCreate', issueQuickCreate);
  module.directive('issuesActivityStream', issuesActivityStream);
  module.directive('issuesListFiltered', issuesListFiltered);
  module.directive('issuesHelpdesk', issuesHelpdesk);
  module.directive('issueCreateDialog', issueCreateDialog);
  module.directive('issueRegistration', issueRegistration);
  module.config(issueRoutes);
}
