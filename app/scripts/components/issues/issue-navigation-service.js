// This service checks users status and returns different sidebar items and router state
export default class IssueNavigationService {
  constructor(usersService, $state) {
    // @ngInject
    this.$state = $state;
    this.usersService = usersService;
  }

  gotoDashboard() {
    return this.usersService.getCurrentUser().then(user => {
      if (user.is_staff || user.is_support) {
        this.$state.go('support.helpdesk');
      } else {
        this.$state.go('support.dashboard');
      }
    });
  }

  getSidebarItems() {
    return this.usersService.getCurrentUser().then(user => {
      if (user.is_staff || user.is_support) {
        return [
          {
            label: 'Helpdesk',
            icon: 'fa-headphones',
            link: 'support.helpdesk'
          }
        ];
      } else {
        return [
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
    });
  }
}
