import template from './select-workspace-toggle.html';
import './select-workspace-toggle.scss';

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

const workspaceIconClasses = {
  organization: 'fa-sitemap',
  project: 'fa-bookmark',
  user: 'fa-user',
  support: 'fa-question-circle'
};

const workspaceButtonClasses = {
  organization: 'btn-primary',
  project: 'btn-success',
  user: 'btn-info',
  support: 'btn-warning'
};

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

    this.$scope.$on('hasCustomer', (event, value) => {
      this.hasCustomer = value;
    });
    this.hasCustomer = this.currentStateService.getHasCustomer();
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

  getIconClass() {
    return ['fa', 'm-r-xs', workspaceIconClasses[this.workspace]];
  }

  getButtonClass() {
    return ['btn', 'select-workspace-toggle', workspaceButtonClasses[this.workspace]];
  }

  getTooltip() {
    if (!this.hasCustomer) {
      return `You don't have any organization yet`;
    }
  }

  selectWorkspace() {
    if (!this.hasCustomer) {
      return;
    }
    this.$uibModal.open({
      component: 'selectWorkspaceDialog',
      size: 'lg'
    });
  }
}
