(function() {
  angular.module('ncsaas').config(function($stateProvider) {
    var tabs = {
      events: {
        url: 'events/',
        templateUrl: 'views/partials/list.html',
        controller: 'UserEventTabController',
        controllerAs: 'Ctrl',
        data: {
          pageTitle: 'Events'
        }
      },
      keys: {
        url: 'keys/',
        templateUrl: 'views/partials/list.html',
        controller: 'UserKeyTabController',
        controllerAs: 'Ctrl',
        data: {
          pageTitle: 'SSH keys'
        }
      },
      notifications: {
        url: 'notifications/',
        templateUrl: 'views/partials/list.html',
        controller: 'HookListController',
        controllerAs: 'Ctrl',
        data: {
          pageTitle: 'Notifications'
        }
      },
      password: {
        url: 'password/',
        templateUrl: 'views/user/tab-password.html',
        controller: 'DetailUpdateProfileController',
        data: {
          pageTitle: 'Password'
        }
      },
      manage: {
        url: 'manage/',
        templateUrl: 'views/user/tab-manage.html',
        controller: 'UserDeleteTabController',
        controllerAs: 'UserDelete',
        data: {
          pageTitle: 'Manage'
        }
      }
    };
    $stateProvider
      .state('profile', {
        url: '/profile/',
        abstract: true,
        templateUrl: 'views/user/base.html',
        data: {
          bodyClass: 'white-bg'
        }
      })

      .state('profile.details', tabs.events)
      .state('profile.keys', tabs.keys)
      .state('profile.notifications', tabs.notifications)
      .state('profile.password', tabs.password)
      .state('profile.manage', tabs.manage)

      .state('users', {
        url: '/users/:uuid/',
        abstract: true,
        templateUrl: 'views/user/base.html',
        data: {
          bodyClass: 'white-bg'
        }
      })

      .state('users.details', angular.copy(tabs.events))
      .state('users.keys', angular.copy(tabs.keys))
      .state('users.notifications', angular.copy(tabs.notifications))
      .state('users.password', angular.copy(tabs.password))
      .state('users.manage', angular.copy(tabs.manage))

      .state('keys', {
        url: '/keys/',
        abstract: true,
        templateUrl: 'views/user/base.html',
        data: {
          bodyClass: 'white-bg',
          pageTitle: 'Add SSH key'
        }
      })

      .state('keys.create', {
        url: 'add/',
        templateUrl: 'views/keys/create.html'
      })

  });
})();
