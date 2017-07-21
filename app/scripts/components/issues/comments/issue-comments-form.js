import template from './issue-comments-form.html';

class IssueCommentsFormController {
  // @ngInject
  constructor($rootScope, issueCommentsService) {
    this.$rootScope = $rootScope;
    this.issueCommentsService = issueCommentsService;
  }

  submit() {
    var form = this.issueCommentsService.$create(this.issue.url + 'comment/');
    form.description = this.description;
    this.submitting = true;
    return form.$save().then(() => {
      this.description = '';
      this.$rootScope.$emit('refreshCommentsList');
    }).finally(() => {
      this.submitting = false;
    });
  }
}

const issueCommentsForm = {
  template,
  controller: IssueCommentsFormController,
  bindings: {
    issue: '<',
  },
};

export default issueCommentsForm;
