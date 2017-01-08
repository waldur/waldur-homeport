import template from './issues-workspace.html';

export default {
  template: template,
  controller: class IssuesWorkspace {
    // @ngInject
    constructor(usersService, $state, $rootScope) {
      this.usersService = usersService;
      this.$state = $state;
      this.$rootScope = $rootScope;
    }

    $onInit() {
      this.usersService.getCurrentUser().then(user => {
        this.user = user;
        this.updateItems();
      });

      this.unlisten = this.$rootScope.$on('$stateChangeSuccess', () => {
        this.pageTitle = this.$state.current.data.pageTitle;
        this.hideBreadcrumbs = this.$state.current.data.hideBreadcrumbs;
      });
    }

    $onDestroy() {
      this.unlisten();
    }

    gotoSupport() {
      if (this.user.is_staff) {
        this.$state.go('support.helpdesk');
      } else {
        this.$state.go('support.dashboard');
      }
    }

    updateItems() {
      if (this.user.is_staff) {
        this.items = [
          {
            label: 'Helpdesk',
            icon: 'fa-headphones',
            link: 'support.helpdesk'
          }
        ];
      } else {
        this.items = [
          {
            label: 'Dashboard',
            icon: 'fa-th-large',
            link: 'support.dashboard'
          },
          {
            label: 'Support requests',
            icon: 'fa-list',
            link: 'support.list'
          },
          {
            label: 'Activity stream',
            icon: 'fa-rss',
            link: 'support.activity',
            feature: 'support.activity'
          },
          {
            label: 'SLAs',
            icon: 'fa-book',
            link: 'support.sla',
            feature: 'support.sla'
          }
        ];
      }
    }
  }
};
