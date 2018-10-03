import IssueCommentsContainer from './IssueCommentsContainer';
import IssueCommentDeleteDialog from './IssueCommentDeleteDialog';

export default module => {
  module.component('issueCommentsContainer', IssueCommentsContainer);
  module.component('issueCommentDeleteDialog', IssueCommentDeleteDialog);
};
