import template from './sidebar.html';
import {WOKSPACE_NAMES} from '../workspace/constants';
import './sidebar.css';

class SidebarController {
  // @ngInject
  constructor(ENV,
              $state,
              $scope,
              WorkspaceService) {
    this.shortPageTitle = ENV.shortPageTitle;
    this.sidebarLogo = ENV.sidebarLogo;
    this.$state = $state;
    this.$scope = $scope;
    this.WorkspaceService = WorkspaceService;
  }

  $onInit() {
    this.$scope.$on('$stateChangeSuccess', this.syncMenu.bind(this));
  }

  $onChanges() {
    this.syncMenu();
  }

  onMenuClick(event, item) {
    if (item.action) {
      item.action();
    }
    if (item.children) {
      item.expanded = !item.expanded;
      event.preventDefault();
    }
  }

  syncMenu() {
    if (!this.items) {
      return;
    }
    let data = this.$state.$current.data;
    this.items.map(item => {
      if (data && data.sidebarState) {
        item.expanded = item.link === data.sidebarState;
        return;
      }
      item.expanded = this.$state.includes(item.link);
    });
  }

  onLogoClick(e) {
    let workspaceData = this.WorkspaceService.getWorkspace();
    let {workspace} = workspaceData;
    e.preventDefault();
    switch (workspace) {
    case WOKSPACE_NAMES.organization:
      this.$state.go('organization.dashboard', {uuid: workspaceData.customer.uuid}, {reload: true});
      break;
    case WOKSPACE_NAMES.support:
      this.$state.go('support.dashboard', {reload: true});
      break;
    case WOKSPACE_NAMES.project:
      this.$state.go('project.details', {uuid: workspaceData.project.uuid}, {reload: true});
      break;
    case WOKSPACE_NAMES.user:
      this.$state.go('profile.details', {reload: true});
      break;
    default:
      this.$state.go('profile.details', {reload: true});
      break;
    }
  }

  getItemCss(item) {
    return {
      'active-with-child': this.hasActiveChild(item),
      'nav-item--expanded': item.expanded,
    };
  }

  hasActiveChild(item) {
    const activeChild = this.getActiveChildFromState(item);
    return !!activeChild;
  }

  getActiveChildFromState(item) {
    if (!item.children) {
      return;
    }
    const { name } = this.$state.current;
    return item.children.find(i => !i.link.indexOf(name));
  }
}

const sidebar = {
  template: template,
  bindings: {
    items: '<',
    context: '<'
  },
  controller: SidebarController,
};

export default sidebar;
