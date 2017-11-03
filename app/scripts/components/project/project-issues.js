import template from './project-issues.html';

class ProjectIssuesController {
  // @ngInject
  constructor(currentStateService, $uibModal, $rootScope) {
    this.currentStateService = currentStateService;
    this.$uibModal = $uibModal;
    this.$rootScope = $rootScope;
  }

  $onInit() {
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

const projectIssues = {
  template: template,
  controller: ProjectIssuesController,
};

export default projectIssues;
