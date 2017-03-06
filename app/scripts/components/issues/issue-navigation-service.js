const HELPDESK_ITEMS = [
  {
    label: gettext('Helpdesk'),
    icon: 'fa-headphones',
    link: 'support.helpdesk'
  }
];

const DASHBOARD_ITEMS = [
  {
    label: gettext('Dashboard'),
    icon: 'fa-th-large',
    link: 'support.dashboard'
  },
  {
    label: gettext('Support requests'),
    icon: 'fa-list',
    link: 'support.list'
  },
  {
    label: gettext('Activity stream'),
    icon: 'fa-rss',
    link: 'support.activity',
    feature: 'support.activity'
  },
  {
    label: gettext('SLAs'),
    icon: 'fa-book',
    link: 'support.sla',
    feature: 'support.sla'
  }
];

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
      if (user.is_support && !user.is_staff) {
        return HELPDESK_ITEMS;
      } else if (user.is_support && user.is_staff) {
        return [...HELPDESK_ITEMS, ...DASHBOARD_ITEMS];
      } else {
        return DASHBOARD_ITEMS;
      }
    });
  }
}
