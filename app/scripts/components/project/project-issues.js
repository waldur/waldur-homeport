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
  constructor(currentStateService, $uibModal, $rootScope) {
    this.currentStateService = currentStateService;
    this.$uibModal = $uibModal;
    this.$rootScope = $rootScope;
    this.init();
  }

  init() {
    this.loading = true;
    this.currentStateService.getProject().then(project => {
      this.setOptions(project);
    }).finally(() => {
      this.loading = false;
    });
  }

  setOptions(project) {
    this.filter = {
      project: project.url
    };
    this.options = {
      disableAutoUpdate: false,
      disableSearch: false,
      hiddenColumns: [
        'customer',
      ],
      tableActions: [
        {
          title: gettext('Create'),
          iconClass: 'fa fa-plus',
          callback: () => {
            this.$uibModal.open({
              component: 'issueCreateDialog',
              resolve: {
                issue: () => ({project})
              }
            });
          }
        }
      ]
    };
  }
}
