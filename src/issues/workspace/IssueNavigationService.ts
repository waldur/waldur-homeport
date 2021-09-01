import { ENV } from '@waldur/configs/default';
import { translate } from '@waldur/i18n';
import { SidebarExtensionService } from '@waldur/navigation/sidebar/SidebarExtensionService';
import { MenuItemType } from '@waldur/navigation/sidebar/types';
import { filterItems } from '@waldur/navigation/sidebar/utils';
import { router } from '@waldur/router';
import store from '@waldur/store/store';
import { UsersService } from '@waldur/user/UsersService';
import { isOwnerOrStaff } from '@waldur/workspace/selectors';
import {
  ORGANIZATION_WORKSPACE,
  PROJECT_WORKSPACE,
  SUPPORT_WORKSPACE,
  User,
  USER_WORKSPACE,
} from '@waldur/workspace/types';

const getHelpdeskItems = (): MenuItemType[] => [
  {
    key: 'helpdesk',
    label: translate('Helpdesk'),
    icon: 'fa-headphones',
    state: 'support.helpdesk',
  },
];

const getDashboardItems = (): MenuItemType[] => [
  {
    key: 'dashboard',
    label: translate('Dashboard'),
    icon: 'fa-th-large',
    state: 'support.dashboard',
  },
  {
    key: 'list',
    label: translate('Support requests'),
    icon: 'fa-list',
    state: 'support.list',
  },
];

const getReportItems = (): MenuItemType[] => [
  ENV.FEATURES.SUPPORT.USERS && {
    label: translate('Users'),
    icon: 'fa-users',
    state: 'support.users',
    key: 'support.users',
  },
  ENV.FEATURES.SUPPORT.CUSTOMERS_LIST && {
    label: translate('Organizations'),
    icon: 'fa-building',
    state: 'support.customers',
    key: 'support.customers',
  },
  {
    label: translate('Organization requests'),
    icon: 'fa-building',
    state: 'support.customers-requests',
    key: 'support.customers-requests',
    feature: 'support.customers-requests',
  },
  {
    label: translate('Broadcast'),
    icon: 'fa-bell',
    state: 'support.broadcast',
    key: 'support.broadcast',
  },
  {
    label: translate('Orders'),
    icon: 'fa-files-o',
    state: 'marketplace-support-orders',
    key: 'support-orders',
  },
  {
    label: translate('Reporting'),
    icon: 'fa-files-o',
    key: 'reporting',
    children: [
      {
        label: translate('Capacity'),
        icon: 'fa-puzzle-piece',
        state: 'marketplace-support-plan-usages',
        key: 'support-plan-usages',
      },
      ENV.FEATURES.SUPPORT.CUSTOMERS_LIST && {
        label: translate('Financial'),
        icon: 'fa-university',
        state: 'support.organizations',
        key: 'support.organizations',
      },
      {
        label: translate('Pricelist'),
        icon: 'fa-table',
        state: 'support.pricelist',
        key: 'support.pricelist',
        feature: 'support.pricelist',
      },
      {
        label: translate('Growth'),
        icon: 'fa-line-chart',
        state: 'invoicesGrowth',
        key: 'invoicesGrowth',
      },
      {
        label: translate('Offerings'),
        icon: 'fa-files-o',
        state: 'marketplace-support-offerings',
        key: 'marketplace-support-offerings',
      },
      ENV.FEATURES.SUPPORT.CUSTOMERS_LIST && {
        label: translate('Organizations'),
        icon: 'fa-building',
        state: 'support.organizations-divisions',
        key: 'support.organizations-divisions',
      },
      ENV.FEATURES.SUPPORT.RESOURCES_TREEMAP && {
        label: translate('Resources usage'),
        icon: 'fa-map',
        state: 'support.resources-treemap',
        key: 'support.resources-treemap',
      },
      {
        label: translate('Usage reports'),
        icon: 'fa-puzzle-piece',
        state: 'marketplace-support-usage-reports',
        key: 'support-usage-reports',
      },
      {
        label: translate('Feedback'),
        icon: 'fa-users',
        state: 'support.feedback',
        key: 'support.feedback',
      },
      {
        label: translate('Audit logs'),
        icon: 'fa-bell-o',
        state: 'support.events',
        key: 'support.events',
      },
    ],
  },
  {
    label: translate('Resources'),
    icon: 'fa-files-o',
    state: 'marketplace-support-resources',
    key: 'marketplace-support-resources',
  },
  ENV.FEATURES.SUPPORT.SHARED_PROVIDERS && {
    label: translate('Shared providers'),
    icon: 'fa-random',
    state: 'support.shared-providers',
    key: 'support.shared-providers',
  },
  {
    label: translate('Usage overview'),
    icon: 'fa-map',
    state: 'support.usage',
    key: 'support.usage',
    feature: 'support.usage',
    children: [
      {
        label: translate('Flowmap'),
        icon: 'fa-sitemap',
        state: 'support.flowmap',
        key: 'support.flowmap',
        feature: 'support.flowmap',
      },
      {
        label: translate('Heatmap'),
        icon: 'fa-fire',
        state: 'support.heatmap',
        key: 'support.heatmap',
        feature: 'support.heatmap',
      },
      {
        label: translate('Sankey diagram'),
        icon: 'fa-code-fork',
        state: 'support.sankey-diagram',
        key: 'support.sankey-diagram',
        feature: 'support.sankey-diagram',
      },
    ],
  },
  {
    label: translate('VM type overview'),
    icon: 'fa-desktop',
    state: 'support.vm-type-overview',
    key: 'vm-type-overview',
    feature: 'support.vm-type-overview',
  },
  {
    label: translate('Features'),
    state: 'support.features',
    icon: 'fa-desktop',
  },
];

// This service checks users status and returns different sidebar items and router state
class IssueNavigationServiceClass {
  currentUser: User;
  prevState;
  prevParams;
  prevWorkspace;

  get isVisible() {
    if (ENV.plugins.WALDUR_SUPPORT) {
      return true;
    }
    return isOwnerOrStaff(store.getState());
  }

  gotoDashboard() {
    if (!ENV.plugins.WALDUR_SUPPORT) {
      return router.stateService.go('marketplace-support-resources');
    }
    return UsersService.getCurrentUser().then((user) => {
      if (user.is_staff || user.is_support) {
        router.stateService.go('support.helpdesk');
      } else {
        router.stateService.go('support.dashboard');
      }
    });
  }

  getSidebarItems() {
    return UsersService.getCurrentUser()
      .then((user) => {
        this.currentUser = user;
        if (!ENV.plugins.WALDUR_SUPPORT) {
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
      .then((items) => {
        if (this.getBackItemLabel()) {
          return [this.getBackItem(), ...items];
        }
        return items;
      })
      .then((items) =>
        SidebarExtensionService.getItems(SUPPORT_WORKSPACE).then((extra) => [
          ...items,
          ...extra,
        ]),
      )
      .then((items) => {
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
      state.data.workspace !== SUPPORT_WORKSPACE
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
      action: () => router.stateService.go(this.prevState, this.prevParams),
    };
  }

  getBackItemLabel() {
    const prevWorkspace = this.prevWorkspace;
    if (prevWorkspace === PROJECT_WORKSPACE) {
      return translate('Back to project');
    } else if (
      prevWorkspace === ORGANIZATION_WORKSPACE &&
      (isOwnerOrStaff(store.getState()) || this.currentUser.is_support)
    ) {
      return translate('Back to organization');
    } else if (prevWorkspace === USER_WORKSPACE) {
      return translate('Back to personal dashboard');
    }
  }
}

export const IssueNavigationService = new IssueNavigationServiceClass();
