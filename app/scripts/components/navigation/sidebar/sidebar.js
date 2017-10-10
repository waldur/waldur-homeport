import template from './sidebar.html';

// @ngInject
class SidebarController {
  constructor(ENV, $state, $scope) {
    this.shortPageTitle = ENV.shortPageTitle;
    this.sidebarLogo = ENV.sidebarLogo;
    this.$state = $state;
    this.$scope = $scope;
  }

  $onInit() {
    this.$scope.$on('$stateChangeSuccess', this.syncMenu.bind(this));
    this.$scope.$watch('items', this.syncMenu.bind(this));
  }

  onMenuClick(event, item) {
    if (item.children) {
      item.expanded = !item.expanded;
      event.preventDefault();
    }
  }

  syncMenu() {
    if (!this.items) {
      return;
    }
    var data = this.$state.$current.data;
    this.items.map(item => {
      if (data && data.sidebarState) {
        item.expanded = item.link === data.sidebarState;
        return;
      }
      item.expanded = this.$state.includes(item.link);
    });
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
