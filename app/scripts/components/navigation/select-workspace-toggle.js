import template from './select-workspace-toggle.html';

export default function selectWorkspaceToggle() {
  return {
    restrict: 'E',
    template: template,
    controller: SelectWorkspaceToggleController,
    controllerAs: '$ctrl',
    bindToController: true,
    scope: {}
  }
}

// @ngInject
class SelectWorkspaceToggleController {
  constructor($scope, $state, $uibModal, currentStateService) {
    this.$scope = $scope;
    this.$state = $state;
    this.$uibModal = $uibModal;
    this.currentStateService = currentStateService;
    this.init();
  }

  init() {
    this.$scope.$on('currentProjectUpdated', this.refreshProject.bind(this));
    this.refreshProject();

    this.$scope.$on('currentCustomerUpdated', this.refreshCustomer.bind(this));
    this.refreshCustomer();

    this.$scope.$on('$stateChangeSuccess', (event, toState) => {
      this.workspace = toState.data.workspace;
    });
    this.workspace = this.$state.current.data.workspace;
  }

  refreshProject() {
    this.currentStateService.getProject().then(project => {
      this.project = project;
    });
  }

  refreshCustomer() {
    this.currentStateService.getCustomer().then(customer => {
      this.customer = customer;
    });
  }

  getTitle() {
    if (this.customer && this.workspace == 'organization') {
      return this.customer.name;
    } else if (this.project && this.workspace == 'project') {
      return this.customer.name + ' > ' + this.project.name;
    } else {
      return 'Select workspace';
    }
  }

  selectWorkspace() {
    this.$uibModal.open({
      component: 'selectWorkspaceDialog',
      size: 'lg'
    });
  }
}
