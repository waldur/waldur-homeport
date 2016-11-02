const tabs = {
  events: {
    url: 'events/',
    templateUrl: 'views/partials/filtered-list.html',
    controller: 'UserEventsListController',
    controllerAs: 'ListController',
    data: {
      pageTitle: 'Audit logs'
    }
  },
  keys: {
    url: 'keys/',
    templateUrl: 'views/partials/filtered-list.html',
    controller: 'KeyListController',
    controllerAs: 'ListController',
    data: {
      pageTitle: 'SSH keys'
    }
  },
  notifications: {
    url: 'notifications/',
    templateUrl: 'views/partials/filtered-list.html',
    controller: 'HookListController',
    controllerAs: 'ListController',
    data: {
      pageTitle: 'Notifications'
    }
  },
  manage: {
    url: 'manage/',
    template: '<user-delete></user-delete>',
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

    .state('profile.details', tabs.events)
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
