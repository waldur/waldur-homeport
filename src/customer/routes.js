import { ProjectsList } from '@waldur/project/ProjectsList';
import { withStore } from '@waldur/store/connect';

import { WOKSPACE_NAMES } from '../navigation/workspace/constants';
import { ProjectCreateContainer } from '../project/ProjectCreateContainer';

import { CustomerDashboardContainer } from './dashboard/CustomerDashboardContainer';
import { CustomerTeam } from './team/CustomerTeam';
import { CustomerEventsView } from './workspace/CustomerEventsList';
import { CustomerIssuesList } from './workspace/CustomerIssuesList';

// @ngInject
function loadCustomer(
  $q,
  $stateParams,
  $state,
  customersService,
  currentStateService,
  WorkspaceService,
) {
  if (!$stateParams.uuid) {
    return $q.reject();
  }
  return customersService
    .$get($stateParams.uuid)
    .then(customer => {
      currentStateService.setCustomer(customer);
      return customer;
    })
    .then(customer => {
      WorkspaceService.setWorkspace({
        customer: customer,
        project: null,
        hasCustomer: true,
        workspace: WOKSPACE_NAMES.organization,
      });
      return customer;
    })
    .catch(error => {
      if (error.status === 404) {
        $state.go('errorPage.notFound');
      }
    });
}

// @ngInject
function CustomerController(
  $scope,
  $state,
  usersService,
  currentStateService,
  customersService,
) {
  usersService.getCurrentUser().then(currentUser => {
    currentStateService.getCustomer().then(currentCustomer => {
      $scope.currentCustomer = currentCustomer;
      $scope.currentUser = currentUser;

      if (
        customersService.checkCustomerUser(currentCustomer, currentUser) ||
        currentUser.is_support
      ) {
        currentStateService.setOwnerOrStaff(true);
      } else {
        currentStateService.setOwnerOrStaff(false);
        $state.go('profile.details');
      }
    });
  });
}

// @ngInject
export default function organizationRoutes($stateProvider) {
  $stateProvider
    .state('organization', {
      url: '/organizations/:uuid/',
      abstract: true,
      data: {
        auth: true,
        workspace: WOKSPACE_NAMES.organization,
      },
      template: '<customer-workspace></customer-workspace>',
      resolve: {
        currentCustomer: loadCustomer,
      },
      controller: CustomerController,
    })

    .state('organization.dashboard', {
      url: 'dashboard/',
      component: withStore(CustomerDashboardContainer),
      data: {
        pageTitle: gettext('Dashboard'),
        pageClass: 'gray-bg',
        hideBreadcrumbs: true,
      },
    })

    .state('organization.details', {
      url: 'events/',
      component: withStore(CustomerEventsView),
      data: {
        pageTitle: gettext('Audit logs'),
      },
    })

    .state('organization.issues', {
      url: 'issues/',
      component: withStore(CustomerIssuesList),
      data: {
        feature: 'support',
        pageTitle: gettext('Issues'),
      },
    })

    .state('organization.projects', {
      url: 'projects/',
      component: withStore(ProjectsList),
      data: {
        pageTitle: gettext('Projects'),
      },
    })

    .state('organization.team', {
      url: 'team/',
      component: withStore(CustomerTeam),
      data: {
        pageTitle: gettext('Team'),
      },
    })

    .state('organization.manage', {
      url: 'manage/',
      template: '<customer-manage></customer-manage>',
      data: {
        pageTitle: gettext('Manage organization'),
        hideBreadcrumbs: true,
      },
    })

    .state('organization.createProject', {
      url: 'createProject/',
      component: withStore(ProjectCreateContainer),
      data: {
        pageTitle: gettext('Create project'),
      },
    });
}
