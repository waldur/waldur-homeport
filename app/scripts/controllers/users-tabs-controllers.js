(function() {
  angular.module('ncsaas')
    .controller('UserEventTabController', [
      '$stateParams',
      'usersService',
      'baseEventListController',
      'ENTITYLISTFIELDTYPES',
      UserEventTabController
    ]);

  function UserEventTabController($stateParams, usersService, baseEventListController, ENTITYLISTFIELDTYPES) {
    var controllerScope = this;
    var EventController = baseEventListController.extend({
      user: null,

      init: function() {
        this.controllerScope = controllerScope;
        this.blockUIElement = 'tab-content';
        this._super();
      },
      getList: function(filter) {
        var vm = this,
          fn = this._super.bind(this);

        return this.getUser().then(function(user) {
          vm.user = user;
          vm.service.defaultFilter.scope = user.url;
          return fn(filter);
        });
      },
      getUser: function() {
        if ($stateParams.uuid) {
          return usersService.$get($stateParams.uuid);
        } else {
          return usersService.getCurrentUser();
        }
      }
    });

    controllerScope.__proto__ = new EventController();
  }

})();

(function() {
  angular.module('ncsaas')
    .controller('UserProjectTabController', [
      '$stateParams',
      'usersService',
      'baseControllerListClass',
      'projectPermissionsService',
      UserProjectTabController
    ]);

  function UserProjectTabController($stateParams, usersService, baseControllerListClass, projectPermissionsService) {
    var controllerScope = this;
    var ProjectController = baseControllerListClass.extend({
      user: null,

      init: function() {
        this.controllerScope = controllerScope;
        this.service = projectPermissionsService;
        this._super();
      },
      getList: function(filter) {
        var vm = this,
          fn = this._super.bind(this);

        return this.getUser().then(function(user) {
          vm.user = user;
          vm.service.defaultFilter.username = user.username;
          return fn(filter);
        });
      },
      getUser: function() {
        if ($stateParams.uuid) {
          return usersService.$get($stateParams.uuid);
        } else {
          return usersService.getCurrentUser();
        }
      }
    });

    controllerScope.__proto__ = new ProjectController();
  }
})();

(function() {
  angular.module('ncsaas')
    .controller('UserKeyTabController', [
      '$stateParams',
      'keysService',
      'baseControllerListClass',
      'usersService',
      'ENTITYLISTFIELDTYPES',
      UserKeyTabController
    ]);

  function UserKeyTabController($stateParams, keysService, baseControllerListClass, usersService, ENTITYLISTFIELDTYPES) {
    var controllerScope = this;
    var Controller = baseControllerListClass.extend({
      user: {},

      init: function() {
        this.controllerScope = controllerScope;
        this.blockUIElement = 'tab-content';
        this.service = keysService;
        this._super();

        this.entityOptions = {
          entityData: {
            noDataText: 'No keys yet',
            createLink: 'keys.create',
            createLinkText: 'Add SSH Key'
          },
          list: [
            {
              type: ENTITYLISTFIELDTYPES.noType,
              propertyName: 'name',
              name: 'Title',
              showForMobile: true
            },
            {
              type: ENTITYLISTFIELDTYPES.noType,
              propertyName: 'fingerprint',
              name: 'Fingerprint',
              className: 'fingerprint'
            }
          ]
        };
        this.actionButtonsListItems = [
          {
            title: 'Remove',
            clickFunction: this.remove.bind(controllerScope)
          }
        ];
      },
      getList: function(filter) {
        var vm = this,
          fn = this._super.bind(this);

        return this.getUser().then(function(user) {
          vm.user = user;
          vm.service.defaultFilter.user_uuid = user.uuid;
          return fn(filter);
        });
      },
      getUser: function() {
        if ($stateParams.uuid) {
          return usersService.$get($stateParams.uuid);
        } else {
          return usersService.getCurrentUser();
        }
      }
    });
    controllerScope.__proto__ = new Controller();
  }
})();
