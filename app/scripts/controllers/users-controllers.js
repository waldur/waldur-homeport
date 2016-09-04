'use strict';

(function() {
  angular.module('ncsaas')
    .service('baseUserDetailUpdateController', [
      'baseControllerDetailUpdateClass',
      'usersService',
      'authService',
      '$translate',
      'LANGUAGE',
      '$stateParams',
      'eventsService',
      baseUserDetailUpdateController
    ]);

  // need for profile page
  function baseUserDetailUpdateController(
    baseControllerDetailUpdateClass, usersService, authService, $translate, LANGUAGE, $stateParams, eventsService) {
    var ControllerClass = baseControllerDetailUpdateClass.extend({
      activeTab: 'keys',
      currentUser: null,

      init: function() {
        this.service = usersService;
        this._super();
        this.LANGUAGE_CHOICES = LANGUAGE.CHOICES;
        this.selectedLanguage = $translate.use();
        this.detailsViewOptions = {
          title: 'Profile',
          hasGravatar: true,
          joinedDate: 'date_joined',
          aboutFields: [
            {
              fieldKey: 'full_name',
              className: 'name',
              emptyText: 'Add name'
            },
            {
              fieldKey: 'email',
              isEditable: true,
              className: 'details',
              emptyText: 'Add email'
            }
          ],
          tabs: [
            {
              title: 'Events',
              key: 'eventlog',
              viewName: 'tabEventlog',
              count: -1,
            },
            {
              title: 'SSH Keys',
              key: 'keys',
              viewName: 'tabKeys',
              count: 0,
              countFieldKey: 'keys'
            }
          ]
        };
      },
      getCurrentUser: function() {
        var vm = this;
        usersService.getCurrentUser().then(function(response) {
          vm.currentUser = response;
          if (vm.currentUser.uuid === vm.model.uuid) {
            vm.canEdit = true;
            vm.detailsViewOptions.tabs.push({
              title: 'Notifications',
              key: 'notifications',
              viewName: 'tabNotifications',
              count: 0,
              countFieldKey: 'hooks'
            });
            vm.detailsViewOptions.tabs.push({
              title: 'Password',
              key: 'password',
              viewName: 'tabPassword',
              count: -1,
              hideSearch: true
            });
            vm.detailsViewOptions.tabs.push({
              title: 'Manage',
              key: 'manage',
              viewName: 'tabManage',
              count: -1,
              hideSearch: true
            });
            vm.detailsViewOptions.activeTab = vm.getActiveTab();
          }
        });
      },
      deleteAccount: function() {
        if (confirm('Are you sure you want to delete account?')) {
          this.model.$delete(
            authService.signout,
            function(errors) {
              alert(errors.data.detail);
            }
          );
        }
      },
      changeLanguage: function() {
        $translate.use(this.selectedLanguage);
      },
      afterActivate: function() {
        this.getCurrentUser();
        this.setCounters();
      },
      getCounters: function() {
        return usersService.getCounters(eventsService.defaultFilter);
      }
    });

    return ControllerClass;
  }

  angular.module('ncsaas')
    .controller('UserDetailUpdateController', [
      'baseUserDetailUpdateController',
      UserDetailUpdateController
    ]);

  function UserDetailUpdateController(baseUserDetailUpdateController) {
    var controllerScope = this;
    var Controller = baseUserDetailUpdateController.extend({
      init:function() {
        this.controllerScope = controllerScope;
        this._super();
        this.detailsState = 'organization.details';
      }
    });

    controllerScope.__proto__ = new Controller();
  }

})();

(function() {
  angular.module('ncsaas')
    .controller('DetailUpdateProfileController', [
      'baseUserDetailUpdateController',
      'usersService',
      'ENV',
      '$stateParams',
      '$rootScope',
      DetailUpdateProfileController
    ]);

  function DetailUpdateProfileController(
    baseUserDetailUpdateController,
    usersService,
    ENV,
    $stateParams,
    $rootScope) {
    var controllerScope = this;
    var Controller = baseUserDetailUpdateController.extend({
      init:function() {
        this.controllerScope = controllerScope;
        this._super();
        this.detailsState = 'profile.details';
        this.showImport = ENV.showImport;
      },
      activate: function() {
        var vm = this;
        usersService.getCurrentUser().then(function(response) {
          vm.model = response;
          vm.afterActivate();
        });
      },
      search: function() {
        $rootScope.$broadcast('generalSearchChanged', this.searchInput);
      }
    });

    controllerScope.__proto__ = new Controller();
  }
})();


(function() {
  angular.module('ncsaas')
    .constant('PRIVATE_USER_TABS', [
      {
          label: "Events",
          icon: "fa-bell-o",
          link: "profile.details"
      },
      {
          label: "SSH Keys",
          icon: "fa-key",
          link: "profile.keys"
      },
      {
          label: "Notifications",
          icon: "fa-bookmark",
          link: "profile.notifications"
      },
      {
          label: "Password",
          icon: "fa-sign-in",
          link: "profile.password"
      },
      {
          label: "Manage",
          icon: "fa-wrench",
          link: "profile.manage"
      }
    ]);

  angular.module('ncsaas')
    .controller('UserDetailsController', UserDetailsController);

  UserDetailsController.$inject = ['$scope', '$stateParams', 'usersService', 'PRIVATE_USER_TABS'];
  function UserDetailsController($scope, $stateParams, usersService, PRIVATE_USER_TABS) {
    var publicTabs = [
      {
          label: "Events",
          icon: "fa-bell-o",
          link: "users.details({uuid: context.user.uuid})"
      },
      {
          label: "SSH Keys",
          icon: "fa-key",
          link: "users.keys({uuid: context.user.uuid})"
      }
    ];
    usersService.getCurrentUser().then(function(user) {
      if (angular.isUndefined($stateParams.uuid) || $stateParams.uuid === user.uuid) {
        $scope.items = PRIVATE_USER_TABS;
        $scope.currentUser = user;
        $scope.context = {user: user};
      } else {
        usersService.$get($stateParams.uuid).then(function(user) {
          $scope.items = publicTabs;
          $scope.currentUser = user;
          $scope.context = {user: user};
        });
      }
    });
  }
})();
