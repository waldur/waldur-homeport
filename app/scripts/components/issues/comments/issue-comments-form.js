import template from './issue-comments-form.html';

class IssueCommentsFormController {
  // @ngInject
  constructor($rootScope, issueCommentsService, ncUtilsFlash) {
    this.$rootScope = $rootScope;
    this.issueCommentsService = issueCommentsService;
    this.ncUtilsFlash = ncUtilsFlash;
  }

  submit() {
    var form = this.issueCommentsService.$create(this.issue.url + 'comment/');
    form.description = this.description;
    this.submitting = true;
    return form.$save().then(() => {
      this.description = '';
      this.$rootScope.$emit('refreshCommentsList');
      this.ncUtilsFlash.success(gettext('Comment has been added.'));
    })
    .catch(() => {
      this.ncUtilsFlash.error(gettext('Unable to add comment.'));
    })
    .finally(() => {
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
