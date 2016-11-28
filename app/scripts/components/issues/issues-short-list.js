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
function IssuesShortListController($timeout) {
  this.loading = true;
  $timeout(() => {
    this.items = DUMMY_ISSUES;
    this.loading = false;
  }, 1000);
}

const DUMMY_ISSUES = [
  {
    key: 'ISSUE-17',
    title: 'Desktop publishing packages and web page editors now use Lorem Ipsum as their default model text',
    labelClass: 'label-warning',
    status: 'Fixed'
  },
  {
    key: 'ISSUE-23',
    title: 'This is issue with the coresponding note',
    labelClass: 'label-primary',
    status: 'Added'
  },
  {
    key: 'ISSUE-4',
    title: 'There are many variations of passages of Lorem Ipsum available, but the majority have suffered',
    labelClass: 'label-danger',
    status: 'Bug'
  }
];
