import issueCommentsService from './issue-comments-service';
import issueCommentsList from './issue-comments-list';
import issueCommentsForm from './issue-comments-form';
import issueCommentsContainer from './issue-comments-container';
import formatJiraMarkupFilter from './filters';

export default module => {
  module.service('issueCommentsService', issueCommentsService);
  module.component('issueCommentsList', issueCommentsList);
  module.component('issueCommentsForm', issueCommentsForm);
  module.component('issueCommentsContainer', issueCommentsContainer);
  module.filter('formatJiraMarkup', formatJiraMarkupFilter);
};
