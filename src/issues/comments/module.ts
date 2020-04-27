import IssueCommentDeleteDialog from './IssueCommentDeleteDialog';
import IssueCommentsContainer from './IssueCommentsContainer';

export default module => {
  module.component('issueCommentsContainer', IssueCommentsContainer);
  module.component('issueCommentDeleteDialog', IssueCommentDeleteDialog);
};
