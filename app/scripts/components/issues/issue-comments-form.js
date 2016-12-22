import template from './issue-comments-form.html';

export default function issueCommentsForm() {
  return {
    restrict: 'E',
    template: template,
    controller: IssueCommentsFormController,
    controllerAs: '$ctrl',
    scope: {
      issue: '=',
      onCommentCreated: '&'
    },
    bindToController: true
  };
}

class IssueCommentsFormController {
  constructor(issueCommentsService) {
    this.issueCommentsService = issueCommentsService;
  }

  submit() {
    var form = this.issueCommentsService.$create(this.issue.url + 'comment/');
    form.description = this.description;
    this.submitting = true;
    return form.$save().then(() => {
      this.description = '';
      return this.onCommentCreated();
    }).finally(() => {
      this.submitting = false;
    });
  }
}
