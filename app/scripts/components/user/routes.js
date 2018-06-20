import { WOKSPACE_NAMES } from '../navigation/workspace/constants';

const tabs = {
  dashboard: {
    url: '',
    template: '<user-dashboard></user-dashboard>',
    data: {
      pageTitle: gettext('User dashboard'),
      pageClass: 'gray-bg',
      hideBreadcrumbs: true
    }
  },
  events: {
    url: 'events/',
    template: '<user-events user="currentUser"></user-events>',
    data: {
      pageTitle: gettext('Audit logs')
    }
  },
  keys: {
    url: 'keys/',
    template: '<key-list></key-list>',
    data: {
      pageTitle: gettext('SSH keys')
    }
  },
  notifications: {
    url: 'notifications/',
    template: '<hook-list></hook-list>',
    data: {
      pageTitle: gettext('Notifications')
    }
  },
  manage: {
    url: 'manage/',
    template: '<user-manage></user-manage>',
    data: {
      pageTitle: gettext('Manage')
    }
  },
  freeipa: {
    url: 'freeipa-account/',
    template: '<freeipa-account></freeipa-account>',
    data: {
      pageTitle: gettext('FreeIPA account'),
      feature: 'freeipa'
    }
  }
};

// @ngInject
function requireIdParam($stateParams, $q) {
  // Abort state transition if mandatory route parameter (UUID) is not specified
  if (!$stateParams.uuid) {
    return $q.reject('UUID is mandatory parameter');
  }
}

// @ngInject
export default function($stateProvider) {
  $stateProvider
    .state('profile', {
      url: '/profile/',
      abstract: true,
      data: {
        auth: true,
        workspace: WOKSPACE_NAMES.user
      },
      template: '<user-details></user-details>',
    })

    .state('profile.details', tabs.dashboard)
    .state('profile.events', tabs.events)
    .state('profile.keys', tabs.keys)
    .state('profile.notifications', tabs.notifications)
    .state('profile.manage', tabs.manage)
    .state('profile.freeipa', tabs.freeipa)

    .state('users', {
      url: '/users/:uuid/',
      abstract: true,
      data: {
        auth: true,
        workspace: WOKSPACE_NAMES.user
      },
      template: '<user-details></user-details>',
      resolve: {
        requireIdParam,
      },
    })

    .state('users.details', angular.copy(tabs.events))
    .state('users.keys', angular.copy(tabs.keys))
    .state('users.notifications', angular.copy(tabs.notifications))
    .state('users.manage', angular.copy(tabs.manage))
    .state('users.freeipa', angular.copy(tabs.freeipa))

    .state('keys', {
      url: '/keys/',
      abstract: true,
      template: '<user-details></user-details>',
      data: {
        auth: true,
        pageTitle: gettext('Add SSH key'),
        workspace: WOKSPACE_NAMES.user
      }
    })

    .state('keys.create', {
      url: 'add/',
      template: '<key-create></key-create>'
    });
}
