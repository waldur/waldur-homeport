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
  }
];

const REPORT_ITEMS = [
  {
    label: gettext('Users'),
    icon: 'fa-users',
    link: 'support.users',
    feature: 'support.users'
  },
  {
    label: gettext('Resources'),
    icon: 'fa-files-o',
    link: 'support.resources',
    feature: 'resources.legacy'
  },
  {
    label: gettext('Orders'),
    icon: 'fa-files-o',
    link: 'marketplace-support-order-items',
    feature: 'marketplace'
  },
  {
    label: gettext('Resources'),
    icon: 'fa-files-o',
    link: 'marketplace-support-resources',
    feature: 'marketplace'
  },
  {
    label: gettext('Plan capacity'),
    icon: 'fa-puzzle-piece',
    link: 'marketplace-support-plan-usages',
    feature: 'marketplace'
  },
  {
    label: gettext('Usage reports'),
    icon: 'fa-puzzle-piece',
    link: 'marketplace-support-usage-reports',
    feature: 'marketplace'
  },
  {
    label: gettext('Resources usage'),
    icon: 'fa-map',
    link: 'support.resources-treemap',
    feature: 'support.resources-treemap'
  },
  {
    label: gettext('Shared providers'),
    icon: 'fa-random',
    link: 'support.shared-providers',
    feature: 'support.shared-providers'
  },
  {
    label: gettext('Financial overview'),
    icon: 'fa-university',
    link: 'support.organizations',
    feature: 'support.organizations'
  },
  {
    label: gettext('Usage overview'),
    icon: 'fa-map',
    link: 'support.usage',
    feature: 'support.usage',
    children: [
      {
        label: gettext('Flowmap'),
        icon: 'fa-sitemap',
        link: 'support.flowmap',
        feature: 'support.flowmap',
      },
      {
        label: gettext('Heatmap'),
        icon: 'fa-fire',
        link: 'support.heatmap',
        feature: 'support.heatmap',
      },
      {
        label: gettext('Sankey diagram'),
        icon: 'fa-code-fork',
        link: 'support.sankey-diagram',
        feature: 'support.sankey-diagram',
      }
    ]
  },
  {
    label: gettext('VM type overview'),
    icon: 'fa-desktop',
    link: 'support.vm-type-overview',
    feature: 'support.vm-type-overview'
  },
];

// This service checks users status and returns different sidebar items and router state
export default class IssueNavigationService {
  // @ngInject
  constructor($state, usersService, currentStateService, features, SidebarExtensionService) {
    this.$state = $state;
    this.usersService = usersService;
    this.currentStateService = currentStateService;
    this.features = features;
    this.sidebarExtensionService = SidebarExtensionService;
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
      if (this.features.isVisible('marketplace')) {
        return this.$state.go('marketplace-support-resources');
      } else {
        return this.$state.go('support.resources');
      }
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
      const dashboardItems = this.sidebarExtensionService.filterItems(DASHBOARD_ITEMS);
      const helpdeskItems = this.sidebarExtensionService.filterItems(HELPDESK_ITEMS);
      if (user.is_support && !user.is_staff) {
        return helpdeskItems;
      } else if (user.is_support && user.is_staff) {
        return [...helpdeskItems, ...dashboardItems];
      } else {
        return dashboardItems;
      }
    }).then(items => {
      items = angular.copy(items);
      if (this.getBackItemLabel()) {
        items.unshift(this.getBackItem());
      }
      return items;
    }).then(items => {
      if (this.currentUser.is_support || this.currentUser.is_staff) {
        return [...items, ...this.sidebarExtensionService.filterItems(REPORT_ITEMS)];
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
