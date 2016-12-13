import template from './project-issues.html';

export default function projectIssues() {
  return {
    restrict: 'E',
    controller: ProjectIssuesController,
    controllerAs: '$ctrl',
    template: template,
    scope: {},
    bindToController: true
  };
}

class ProjectIssuesController {
  constructor(currentStateService) {
    this.loading = true;
    currentStateService.getProject().then(project => {
      this.project = project;
    }).finally(() => {
      this.loading = false;
    });
  }
}
