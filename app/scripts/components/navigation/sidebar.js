import template from './sidebar.html';

export default function sidebar() {
  return {
    restrict: 'E',
    scope: {
      items: '=',
      context: '='
    },
    template: template,
    controller: SidebarController,
    controllerAs: '$ctrl',
    bindToController: true
  };
}

// @ngInject
class SidebarController {
  constructor(ENV, $state, $scope) {
    this.brandName = ENV.shortPageTitle;
    this.$state = $state;
    $scope.$on('$stateChangeSuccess', this.syncMenu.bind(this));
    $scope.$watch('items', this.syncMenu.bind(this));
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
