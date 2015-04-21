'use strict';

angular

  // module name and dependencies
  .module('ncsaas', [
    'satellizer',
    'ui.router',
    'ngCookies',
    'ngResource',
    'duScroll'])
  // urls
  .config(function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/');

    $stateProvider
      .state('home', {
        url: '/',
        abstract: true,
        templateUrl: 'views/home/base.html',
        resolve: {
          authenticated: notLoggedCheck
        }
      })

      .state('home.home', {
        url: '',
        views: {
          'siteHeader@home' : {
            templateUrl: 'views/partials/site-header.html',
          },
          'siteContent@home' : {
            templateUrl: 'views/home/home.html',
          },
          'siteFooter@home' : {
            templateUrl: 'views/partials/site-footer.html',
          }
        },
        resolve: {
          authenticated: notLoggedCheck
        }
      })

      .state('home.login', {
        url: 'login/',
        controller: 'AuthController',
        views: {
          'siteContent@home' : {
            templateUrl: 'views/home/login.html',
          },
        },
        resolve: {
          authenticated: notLoggedCheck
        }
      })

      .state('initialdata', {
        url: '/initial-data/',
        templateUrl: 'views/initial-data.html',
        resolve: {
          authenticated: authCheck
        }
      })

      .state('dashboard', {
        url: '/dashboard/',
        templateUrl: 'views/dashboard.html',
        resolve: {
          authenticated: authCheck
        }
      })

      .state('projects', {
        url: '/projects/',
        abstract: true,
        templateUrl: 'views/project/base.html',
      })

      .state('projects.list', {
        url: '',
        views: {
          'appContent': {
            templateUrl: 'views/project/list.html',
          },
          'appHeader': {
            templateUrl: 'views/partials/app-header.html',
          },
          'appFooter': {
            templateUrl: 'views/partials/app-footer.html',
          }
        },
        resolve: {
          authenticated: authCheck
        },
        auth: true
      })

      .state('projects.create', {
        url: 'add/',
        views: {
          'appContent': {
            templateUrl: 'views/project/create.html',
          },
          'appHeader': {
            templateUrl: 'views/partials/app-header.html',
          },
          'appFooter': {
            templateUrl: 'views/partials/app-footer.html',
          }
        },
        resolve: {
          authenticated: authCheck
        },
        auth: true
      })

      .state('projects.details', {
        url: ':uuid/',
        views: {
          'appContent': {
            templateUrl: 'views/project/details.html',
          },
          'controlsList@projects.details' : {
            templateUrl: 'views/partials/controls-line.html',
          },
          'tabEventlog@projects.details' : {
            templateUrl: 'views/project/tab-eventlog.html',
          },
          'tabResources@projects.details' : {
            templateUrl: 'views/project/tab-resources.html',
          },
          'tabUsers@projects.details' : {
            templateUrl: 'views/project/tab-users.html',
          },
          'appHeader': {
            templateUrl: 'views/partials/app-header.html',
          },
          'appFooter': {
            templateUrl: 'views/partials/app-footer.html',
          }
        },
        resolve: {
          authenticated: authCheck
        },
        auth: true
      })

      .state('projects.update', {
        url: ':uuid/edit/',
        views: {
          'appContent': {
            templateUrl: 'views/project/update.html',
          },
          'appHeader': {
            templateUrl: 'views/partials/app-header.html',
          },
          'appFooter': {
            templateUrl: 'views/partials/app-footer.html',
          }
        },
        resolve: {
          authenticated: authCheck
        },
        auth: true
      })

      .state('services', {
        url: '/services/',
        abstract: true,
        templateUrl: 'views/service/base.html'
      })

      .state('services.list', {
        url: '',
        views: {
          'appContent': {
            templateUrl: 'views/service/list.html'
          },
          'appHeader': {
            templateUrl: 'views/partials/app-header.html'
          },
          'appFooter': {
            templateUrl: 'views/partials/app-footer.html'
          }
        },
        resolve: {
          authenticated: authCheck
        }
      })

      .state('services.create', {
        url: 'add/',
        views: {
          'appContent': {
            templateUrl: 'views/service/create.html'
          },
          'appHeader': {
            templateUrl: 'views/partials/app-header.html'
          },
          'appFooter': {
            templateUrl: 'views/partials/app-footer.html'
          }
        },
        resolve: {
          authenticated: authCheck
        },
        auth: true
      })

      .state('profile', {
        url: '/profile/',
        abstract: true,
        templateUrl: 'views/profile/base.html',
      })

      .state('profile.details', {
        url: '',
        views: {
          'appContent': {
            templateUrl: 'views/profile/details.html',
          },
          'appHeader': {
            templateUrl: 'views/partials/app-header.html',
          },
          'appFooter': {
            templateUrl: 'views/partials/app-footer.html',
          }
        },
        resolve: {
          authenticated: authCheck
        },
        auth: true
      })

      .state('profile.update', {
        url: 'edit/',
        views: {
          'appContent': {
            templateUrl: 'views/profile/update.html',
          },
          'appHeader': {
            templateUrl: 'views/partials/app-header.html',
          },
          'appFooter': {
            templateUrl: 'views/partials/app-footer.html',
          }
        },
        resolve: {
          authenticated: authCheck
        },
        auth: true
      })

      .state('customers', {
        url: '/customers/',
        abstract: true,
        templateUrl: 'views/customer/base.html',
      })

      .state('customers.list', {
        url: '',
        views: {
          'appContent': {
            templateUrl: 'views/customer/list.html',
          },
          'appHeader': {
            templateUrl: 'views/partials/app-header.html',
          },
          'appFooter': {
            templateUrl: 'views/partials/app-footer.html',
          }
        },
        resolve: {
          authenticated: authCheck
        },
        auth: true
      })

      .state('customers.details', {
        url: ':uuid/',
        views: {
          'appContent': {
            templateUrl: 'views/customer/details.html',
          },
          'tabResources@customers.details': {
            templateUrl: 'views/customer/tab-resources.html',
          },
          'tabProjects@customers.details': {
            templateUrl: 'views/customer/tab-projects.html',
          },
          'tabServices@customers.details': {
            templateUrl: 'views/customer/tab-services.html',
          },
          'appHeader': {
            templateUrl: 'views/partials/app-header.html',
          },
          'appFooter': {
            templateUrl: 'views/partials/app-footer.html',
          }
        },
        resolve: {
          authenticated: authCheck
        },
        auth: true
      })

      .state('customers.edit', {
        url: ':uuid/edit/',
        views: {
          'appContent': {
            templateUrl: 'views/customer/update.html',
          },
          'appHeader': {
            templateUrl: 'views/partials/app-header.html',
          },
          'appFooter': {
            templateUrl: 'views/partials/app-footer.html',
          }
        },
        resolve: {
          authenticated: authCheck
        },
        auth: true
      })

      .state('customer-plans', {
        url: '/customers/:uuid/plans/',
        templateUrl: 'views/customer-plans.html',
        resolve: {
          authenticated: authCheck
        }
      })

      .state('users', {
        url: '/users/',
        abstract: true,
        templateUrl: 'views/user/base.html'
      })

      .state('users.list', {
        url: '',
        views: {
          'appContent': {
            templateUrl: 'views/user/list.html',
          },
          'appHeader': {
            templateUrl: 'views/partials/app-header.html',
          },
          'appFooter': {
            templateUrl: 'views/partials/app-footer.html',
          }
        },
        resolve: {
          authenticated: authCheck
        },
        auth: true
      })

      .state('users.details', {
        url: '/users/:uuid/',
        views: {
          'appContent': {
            templateUrl: 'views/user/details.html',
          },
          'controlsListUser@users.details' : {
            templateUrl: 'views/partials/controls-line-user.html',
          },
          'tabEventlog@users.details': {
            templateUrl: 'views/user/tab-eventlog.html',
          },
          'tabProjects@users.details': {
            templateUrl: 'views/user/tab-projects.html',
          },
          'tabKeys@users.details': {
            templateUrl: 'views/user/tab-keys.html',
          },
          'tabManageUser@users.details': {
            templateUrl: 'views/user/tab-manage.html',
          },
          'appHeader': {
            templateUrl: 'views/partials/app-header.html',
          },
          'appFooter': {
            templateUrl: 'views/partials/app-footer.html',
          }
        },
        resolve: {
          authenticated: authCheck
        },
        auth: true
      })

      .state('resources', {
        url: '/resources/',
        abstract: true,
        templateUrl: 'views/resource/base.html',
        resolve: {
          authenticated: authCheck
        }
      })

      .state('resources.list', {
        url: '',
        views: {
          'appContent': {
            templateUrl: 'views/resource/list.html',
          },
          'appHeader': {
            templateUrl: 'views/partials/app-header.html',
          },
          'appFooter': {
            templateUrl: 'views/partials/app-footer.html',
          }
        },
        resolve: {
          authenticated: authCheck
        }
      })

      .state('resources.create', {
        url: 'add/',
        views: {
          'appContent': {
            templateUrl: 'views/resource/create.html',
          },
          'appHeader': {
            templateUrl: 'views/partials/app-header.html',
          },
          'appFooter': {
            templateUrl: 'views/partials/app-footer.html',
          }
        },
        resolve: {
          authenticated: authCheck
        }
      })

      .state('payment', {
        url: '/payment/',
        abstract: true,
        templateUrl: 'views/payment/base.html',
      })

      .state('payment.checkout', {
        url: '',
        views: {
          'appContent': {
            templateUrl: 'views/payment/checkout.html',
          },
          'appHeader': {
            templateUrl: 'views/partials/app-header.html',
          },
          'appFooter': {
            templateUrl: 'views/partials/app-footer.html',
          }
        },
        resolve: {
          authenticated: authCheck
        },
        auth: true
      })

      .state('payment.success', {
        url: 'success/',
        views: {
          'appContent': {
            templateUrl: 'views/payment/success.html',
          },
          'appHeader': {
            templateUrl: 'views/partials/app-header.html',
          },
          'appFooter': {
            templateUrl: 'views/partials/app-footer.html',
          }
        },
        resolve: {
          authenticated: authCheck
        },
        auth: true
      });

    function authCheck($q, $location, $auth) {
      var deferred = $q.defer();

      if (!$auth.isAuthenticated()) {
        // can't use $state because its will throw recursion error
        $location.path('/login/');
      } else {
        deferred.resolve();
      }

      return deferred.promise;
    }

    function notLoggedCheck($q, $location, $auth) {
      var deferred = $q.defer();

      if ($auth.isAuthenticated()) {
        // can't use $state because its will throw recursion error
        $location.path('/dashboard/');
      } else {
        deferred.resolve();
      }

      return deferred.promise;
    }
  });

(function() {
  angular.module('ncsaas')
    .config(['ENV', 'CUSTOMENV', overrideBaseSettings]);

    function overrideBaseSettings(ENV, CUSTOMENV) {
      for (var property in CUSTOMENV) {
        if (CUSTOMENV.hasOwnProperty(property)) {
            ENV[property] = CUSTOMENV[property];
        }
      }
    }

})();
