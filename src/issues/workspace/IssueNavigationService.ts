import { ENV } from '@waldur/configs/default';
import { translate } from '@waldur/i18n';
import { MenuItemType } from '@waldur/navigation/sidebar/types';
import { router } from '@waldur/router';
import { UsersService } from '@waldur/user/UsersService';
import { User } from '@waldur/workspace/types';

// This service checks users status and returns different sidebar items and router state
class IssueNavigationServiceClass {
  currentUser: User;
  prevState;
  prevParams;
  prevWorkspace;

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
      state: 'reporting.organizations',
      key: 'reporting.organizations',
      feature: 'support.customers_list',
    },
    {
      label: translate('Pricelist'),
      icon: 'fa-table',
      state: 'reporting.pricelist',
      key: 'reporting.pricelist',
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
      state: 'reporting.organizations-divisions',
      key: 'reporting.organizations-divisions',
      feature: 'support.customers_list',
    },
    {
      label: translate('Resources usage'),
      icon: 'fa-map',
      state: 'reporting.resources-treemap',
      key: 'reporting.resources-treemap',
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
      state: 'reporting.vm-type-overview',
      key: 'vm-type-overview',
      feature: 'support.vm_type_overview',
    },
  ];
}
