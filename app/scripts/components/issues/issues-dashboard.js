import template from './issues-dashboard.html';

export default function issuesDashboard() {
  return {
    restrict: 'E',
    template: template,
    controller: IssuesDashboardController,
  };
}

function IssuesDashboardController() {

}
