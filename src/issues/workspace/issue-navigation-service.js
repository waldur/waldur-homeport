import { translate } from '@waldur/i18n';
import { filterItems } from '@waldur/navigation/sidebar/utils';

const getHelpdeskItems = () => [
  {
    label: translate('Helpdesk'),
    icon: 'fa-headphones',
    state: 'support.helpdesk',
  },
];

const getDashboardItems = () => [
  {
    label: translate('Dashboard'),
    icon: 'fa-th-large',
    state: 'support.dashboard',
  },
  {
    label: translate('Support requests'),
    icon: 'fa-list',
    state: 'support.list',
  },
];

const getReportItems = () => [
  {
    label: translate('Users'),
    icon: 'fa-users',
    state: 'support.users',
    feature: 'support.users',
  },
  {
    label: translate('Financial overview'),
    icon: 'fa-university',
    state: 'support.organizations',
    feature: 'support.organizations',
  },
  {
    label: translate('Orders'),
    icon: 'fa-files-o',
    state: 'marketplace-support-order-items',
  },
  {
    label: translate('Resources'),
    icon: 'fa-files-o',
    state: 'marketplace-support-resources',
  },
  {
    label: translate('Plan capacity'),
    icon: 'fa-puzzle-piece',
    state: 'marketplace-support-plan-usages',
  },
  {
    label: translate('Usage reports'),
    icon: 'fa-puzzle-piece',
    state: 'marketplace-support-usage-reports',
  },
  {
    label: translate('Resources usage'),
    icon: 'fa-map',
    state: 'support.resources-treemap',
    feature: 'support.resources-treemap',
  },
  {
    label: translate('Shared providers'),
    icon: 'fa-random',
    state: 'support.shared-providers',
    feature: 'support.shared-providers',
  },
  {
    label: translate('Usage overview'),
    icon: 'fa-map',
    state: 'support.usage',
    feature: 'support.usage',
    children: [
      {
        label: translate('Flowmap'),
        icon: 'fa-sitemap',
        state: 'support.flowmap',
        feature: 'support.flowmap',
      },
      {
        label: translate('Heatmap'),
        icon: 'fa-fire',
        state: 'support.heatmap',
        feature: 'support.heatmap',
      },
      {
        label: translate('Sankey diagram'),
        icon: 'fa-code-fork',
        state: 'support.sankey-diagram',
        feature: 'support.sankey-diagram',
      },
    ],
  },
  {
    label: translate('VM type overview'),
    icon: 'fa-desktop',
    state: 'support.vm-type-overview',
    feature: 'support.vm-type-overview',
  },
];

// This service checks users status and returns different sidebar items and router state
export default class IssueNavigationService {
  // @ngInject
  constructor(
    $state,
    usersService,
    currentStateService,
    features,
    SidebarExtensionService,
  ) {
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
    return this.usersService
      .getCurrentUser()
      .then(user => {
        this.currentUser = user;
        if (!this.features.isVisible('support')) {
          return [];
        }
        const dashboardItems = filterItems(getDashboardItems());
        const helpdeskItems = filterItems(getHelpdeskItems());
        if (user.is_support && !user.is_staff) {
          return helpdeskItems;
        } else if (user.is_support && user.is_staff) {
          return [...helpdeskItems, ...dashboardItems];
        } else {
          return dashboardItems;
        }
      })
      .then(items => {
        items = angular.copy(items);
        if (this.getBackItemLabel()) {
          items.unshift(this.getBackItem());
        }
        return items;
      })
      .then(items =>
        this.sidebarExtensionService
          .getItems('support')
          .then(extra => [...items, ...extra]),
      )
      .then(items => {
        if (this.currentUser.is_support || this.currentUser.is_staff) {
          return [...items, ...filterItems(getReportItems())];
        }
        return items;
      });
  }

  setPrevState(state, params) {
    if (
      state.data &&
      state.data.workspace &&
      state.data.workspace !== 'support'
    ) {
      this.prevState = state;
      this.prevParams = params;
      this.prevWorkspace = state.data.workspace;
    }
  }

  getBackItem() {
    return {
      label: this.getBackItemLabel(),
      icon: 'fa-arrow-left',
      action: () => this.$state.go(this.prevState, this.prevParams),
    };
  }

  getBackItemLabel() {
    const prevWorkspace = this.prevWorkspace;
    if (prevWorkspace === 'project') {
      return translate('Back to project');
    } else if (
      prevWorkspace === 'organization' &&
      (this.currentStateService.getOwnerOrStaff() ||
        this.currentUser.is_support)
    ) {
      return translate('Back to organization');
    } else if (prevWorkspace === 'user') {
      return translate('Back to personal dashboard');
    }
  }
}

// @ngInject
export function attachStateUtils($rootScope, IssueNavigationService) {
  $rootScope.$on('$stateChangeSuccess', function(
    event,
    toState,
    toParams,
    fromState,
    fromParams,
  ) {
    IssueNavigationService.setPrevState(fromState, fromParams);
  });
}
