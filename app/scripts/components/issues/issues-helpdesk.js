import template from './issues-helpdesk.html';

export default function issuesHelpdesk() {
  return {
    restrict: 'E',
    template: template,
    controller: IssuesHelpdeskController,
    controllerAs: '$ctrl',
    scope: {},
    bindToController: {
      label: '=',
      filter: '='
    }
  };
}

function IssuesHelpdeskController() {

}
