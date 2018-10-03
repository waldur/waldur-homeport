import template from './issues-workspace.html';
import { WOKSPACE_NAMES } from '@waldur/navigation/workspace/constants';

export default {
  template: template,
  controller: class IssuesWorkspace {
    // @ngInject
    constructor($state, $rootScope, WorkspaceService, IssueNavigationService) {
      this.$state = $state;
      this.$rootScope = $rootScope;
      this.WorkspaceService = WorkspaceService;
      this.IssueNavigationService = IssueNavigationService;
    }

    $onInit() {
      this.WorkspaceService.setWorkspace({
        hasCustomer: true,
        workspace: WOKSPACE_NAMES.support,
      });

      this.IssueNavigationService.getSidebarItems().then(items => this.items = items);
      this.unlisten = this.$rootScope.$on('$stateChangeSuccess', this.syncNavigation.bind(this));
      this.syncNavigation();
    }

    syncNavigation() {
      this.pageTitle = this.$state.current.data.pageTitle;
      this.hideBreadcrumbs = this.$state.current.data.hideBreadcrumbs;
    }

    $onDestroy() {
      this.unlisten();
    }

    gotoDashboard() {
      return this.IssueNavigationService.gotoDashboard();
    }
  }
};
