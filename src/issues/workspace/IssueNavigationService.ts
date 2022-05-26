import { ENV } from '@waldur/configs/default';
import { translate } from '@waldur/i18n';
import { MenuItemType } from '@waldur/navigation/sidebar/types';
import { router } from '@waldur/router';
import store from '@waldur/store/store';
import { UsersService } from '@waldur/user/UsersService';
import { isOwnerOrStaff } from '@waldur/workspace/selectors';
import { User } from '@waldur/workspace/types';

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
}

export const IssueNavigationService = new IssueNavigationServiceClass();

export function getReportingItems(): MenuItemType[] {
  return [
    {
      label: translate('Capacity'),
      icon: 'fa-puzzle-piece',
      state: 'marketplace-support-plan-usages',
      key: 'support-plan-usages',
    },
    {
      label: translate('Financial'),
      icon: 'fa-university',
      state: 'support.organizations',
      key: 'support.organizations',
      feature: 'support.customers_list',
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
      label: translate('Organizations'),
      icon: 'fa-building',
      state: 'support.organizations-divisions',
      key: 'support.organizations-divisions',
      feature: 'support.customers_list',
    },
    {
      label: translate('Resources usage'),
      icon: 'fa-map',
      state: 'support.resources-treemap',
      key: 'support.resources-treemap',
      feature: 'support.resources_treemap',
    },
    {
      label: translate('Usage reports'),
      icon: 'fa-puzzle-piece',
      state: 'marketplace-support-usage-reports',
      key: 'support-usage-reports',
    },
    {
      label: translate('VM type overview'),
      icon: 'fa-desktop',
      state: 'support.vm-type-overview',
      key: 'vm-type-overview',
      feature: 'support.vm_type_overview',
    },
  ];
}
