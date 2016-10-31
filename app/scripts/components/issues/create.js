import template from './create.html';

export default function issueCreate() {
  return {
    restrict: 'E',
    template: template,
    controller: IssueCreateController,
    controllerAs: 'IssueAdd'
  };
}

// @ngInject
function IssueCreateController(issuesService, baseControllerAddClass, $stateParams, $state) {
  var controllerScope = this;
  var controllerClass = baseControllerAddClass.extend({
    init: function() {
      this.service = issuesService;
      this.controllerScope = controllerScope;
      this._super();
      this.listState = 'support.list';
      this.issue = this.instance;
      this.issue.summary = "Problem";
      this.issue.description = "";
      this.title = 'Add ticket';
      this.descriptionLabel = 'Ticket description';
      this.descriptionPlaceholder = 'Problem description';
      this.type = $stateParams.type;
      this.summaryLabel = 'Ticket name';
      if (this.type === 'remove_user') {
        this.issue.summary = "Account removal";
        this.title = 'Account removal';
        this.descriptionPlaceholder = 'Why would you want to go away? Help us become better please!';
        this.descriptionLabel = 'Reason';
      } else if (this.type === 'add_service') {
        this.title = 'Request a new service';
        this.issue.summary = '';
        this.summaryLabel = 'Service name';
        this.descriptionLabel = 'Motivation';
        this.descriptionPlaceholder = 'Please clarify why do you need it';
      }
    },
    getSuccessMessage: function() {
      return this.successMessage.replace('{vm_name}', this.instance.summary);
    },
    saveInstance: function() {
      return this.service.createIssue(this.instance);
    },
    cancel: function() {
      if (this.type === 'remove_user') {
        return $state.go('profile.manage');
      }
      this._super();
    }
  });

  controllerScope.__proto__ = new controllerClass();
}
