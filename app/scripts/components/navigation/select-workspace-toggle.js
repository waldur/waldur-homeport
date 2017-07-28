import template from './select-workspace-toggle.html';
import './select-workspace-toggle.scss';

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
  constructor(WorkspaceService, $scope, $rootScope, NavigationUtilsService) {
    this.WorkspaceService = WorkspaceService;
    this.$scope = $scope;
    this.$rootScope = $rootScope;
    this.NavigationUtilsService = NavigationUtilsService;
  }

  $onInit() {
    this.unlisten = this.$rootScope.$on('WORKSPACE_CHANGED', this.refreshWorkspace.bind(this));
    this.refreshWorkspace();
    this.$scope.$emit('selectWorkspaceToggle.initialized');
  }

  $onDestroy() {
    this.unlisten();
  }

  refreshWorkspace() {
    const options = this.WorkspaceService.getWorkspace();
    if (options) {
      this.hasCustomer = options.hasCustomer;
      this.customer = options.customer;
      this.project = options.project;
      this.workspace = options.workspace;
    }
  }

  getTitle() {
    if (this.customer && this.workspace == 'organization') {
      return this.customer.name;
    } else if (this.project && this.workspace == 'project') {
      return this.customer.name + ' > ' + this.project.name;
    }
  }

  getIconClass() {
    return ['fa', 'm-r-xs', workspaceIconClasses[this.workspace]];
  }

  getButtonClass() {
    const cls = workspaceButtonClasses[this.workspace] || 'btn-default';
    return ['btn', 'select-workspace-toggle', cls];
  }

  getTooltip() {
    if (!this.hasCustomer) {
      return gettext('You don\'t have any organization yet.');
    }
  }

  changeWorkspace() {
    if (!this.hasCustomer) {
      return;
    }

    this.NavigationUtilsService.selectWorkspace();
  }
}

const selectWorkspaceToggle = {
  template: template,
  controller: SelectWorkspaceToggleController,
};

export default selectWorkspaceToggle;
