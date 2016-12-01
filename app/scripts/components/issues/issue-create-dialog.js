import { CUSTOMERS } from './fake-issues-service';
import { USERS } from './fixtures';
import { ISSUE_TYPE_CHOICES } from './constants';
import template from './issue-create-dialog.html';

export default function issueCreateDialog() {
  return {
    restrict: 'E',
    template: template,
    controller: IssueCreateDialogController,
    controllerAs: '$ctrl',
    scope: {},
    bindToController: {
      close: '&',
      dismiss: '&',
      resolve: '='
    }
  };
}

class IssueCreateDialogController {
  constructor(FakeIssuesService) {
    this.service = FakeIssuesService;
    this.issue = this.resolve.initial;
    this.customers = CUSTOMERS;
    this.users = USERS;
    this.types = ISSUE_TYPE_CHOICES;
  }

  save() {
    return this.service.createIssue(this.issue).then(() => {
      this.close();
    });
  }
}
