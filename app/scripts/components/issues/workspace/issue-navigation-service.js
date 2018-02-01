const HELPDESK_ITEMS = [
  {
    label: gettext('Helpdesk'),
    icon: 'fa-headphones',
    link: 'support.helpdesk'
  },
  {
    label: gettext('Users'),
    icon: 'fa-users',
    link: 'support.users'
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
  }
];

const REPORT_ITEMS = [
  {
    label: gettext('Resources'),
    icon: 'fa-files-o',
    link: 'support.resources',
    feature: 'support.resources'
  },
  {
    label: gettext('Financial overview'),
    icon: 'fa-university',
    link: 'support.organizations',
    feature: 'support.organizations'
  }
];

// This service checks users status and returns different sidebar items and router state
export default class IssueNavigationService {
  // @ngInject
  constructor($state, usersService, currentStateService, features) {
    this.$state = $state;
    this.usersService = usersService;
    this.currentStateService = currentStateService;
    this.features = features;
  }

  get isVisible() {
    if (this.features.isVisible('support')) {
      return true;
    }
    const user = this.usersService.currentUser;
    return user && (user.is_staff || user.is_support);
  }

  gotoDashboard() {
    if (!this.features.isVisible('support')) {
      return this.$state.go('support.resources');
    }
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
      this.currentUser = user;
      if (!this.features.isVisible('support')) {
        return [];
      }
      if (user.is_support && !user.is_staff) {
        return HELPDESK_ITEMS;
      } else if (user.is_support && user.is_staff) {
        return [...HELPDESK_ITEMS, ...DASHBOARD_ITEMS];
      } else {
        return DASHBOARD_ITEMS;
      }
    }).then(items => {
      items = angular.copy(items);
      if (this.getBackItemLabel()) {
        items.unshift(this.getBackItem());
      }
      return items;
    }).then(items => {
      if (this.currentUser.is_support || this.currentUser.is_staff) {
        return [...items, ...REPORT_ITEMS];
      }
      return items;
    });
  }

  setPrevState(state, params) {
    if (state.data && state.data.workspace && state.data.workspace !== 'support') {
      this.prevState = state;
      this.prevParams = params;
      this.prevWorkspace = state.data.workspace;
    }
  }

  getBackItem() {
    return {
      label: this.getBackItemLabel(),
      icon: 'fa-arrow-left',
      action: () => this.$state.go(this.prevState, this.prevParams)
    };
  }

  getBackItemLabel() {
    const prevWorkspace = this.prevWorkspace;
    if (prevWorkspace === 'project') {
      return gettext('Back to project');
    } else if (prevWorkspace === 'organization' &&
      (this.currentStateService.getOwnerOrStaff() || this.currentUser.is_support)) {
      return gettext('Back to organization');
    } else if (prevWorkspace === 'user') {
      return gettext('Back to personal dashboard');
    }
  }
}

// @ngInject
export function attachStateUtils($rootScope, IssueNavigationService) {
  $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
    IssueNavigationService.setPrevState(fromState, fromParams);
  });
}
