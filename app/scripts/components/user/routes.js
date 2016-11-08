const tabs = {
  dashboard: {
    url: '',
    template: '<user-dashboard></user-dashboard>',
    data: {
      pageTitle: 'User dashboard',
      pageClass: 'gray-bg'
    }
  },
  events: {
    url: 'events/',
    template: '<user-events></user-events>',
    data: {
      pageTitle: 'Audit logs'
    }
  },
  keys: {
    url: 'keys/',
    template: '<key-list></key-list>',
    data: {
      pageTitle: 'SSH keys'
    }
  },
  notifications: {
    url: 'notifications/',
    template: '<hook-list></hook-list>',
    data: {
      pageTitle: 'Notifications'
    }
  },
  manage: {
    url: 'manage/',
    template: '<user-manage></user-manage>',
    data: {
      pageTitle: 'Manage'
    }
  }
};

// @ngInject
export default function($stateProvider) {
  $stateProvider
    .state('profile', {
      url: '/profile/',
      abstract: true,
      data: {
        auth: true
      },
      template: '<user-details></user-details>',
    })

    .state('profile.details', tabs.dashboard)
    .state('profile.events', tabs.events)
    .state('profile.keys', tabs.keys)
    .state('profile.notifications', tabs.notifications)
    .state('profile.manage', tabs.manage)

    .state('users', {
      url: '/users/:uuid/',
      abstract: true,
      data: {
        auth: true
      },
      template: '<user-details></user-details>',
    })

    .state('users.details', angular.copy(tabs.events))
    .state('users.keys', angular.copy(tabs.keys))
    .state('users.notifications', angular.copy(tabs.notifications))
    .state('users.manage', angular.copy(tabs.manage))

    .state('keys', {
      url: '/keys/',
      abstract: true,
      template: '<user-details></user-details>',
      data: {
        auth: true,
        pageTitle: 'Add SSH key'
      }
    })

    .state('keys.create', {
      url: 'add/',
      template: '<key-create></key-create>'
    })
};
