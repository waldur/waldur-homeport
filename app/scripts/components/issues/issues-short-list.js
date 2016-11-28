import template from './issues-short-list.html';

export default function issuesShortList() {
  return {
    restrict: 'E',
    template: template,
    controller: IssuesShortListController,
    controllerAs: '$ctrl',
    scope: {},
    bindToController: true
  };
}

// ngInject
function IssuesShortListController(FakeIssuesService) {
  this.loading = true;
  const classes = {
    TODO: 'label-primary',
    FIXED: 'label-warning',
    BUG: 'label-danger'
  };
  FakeIssuesService.getList({personal: true}).then(items => {
    this.items = items.map(item => {
      item.labelClass = classes[item.status];
      return item;
    });
    this.loading = false;
  });
}

