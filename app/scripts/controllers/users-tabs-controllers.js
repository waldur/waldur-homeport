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
        this.service = keysService;
        this._super();

        this.entityOptions = {
          entityData: {
            noDataText: 'No keys yet',
            rowTemplateUrl: 'views/user/key-row.html'
          },
          list: [
            {
              type: ENTITYLISTFIELDTYPES.noType,
              propertyName: 'name',
              name: 'Title'
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
            icon: 'fa-trash',
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
          if (angular.isUndefined($stateParams.uuid) || user.uuid === $stateParams.uuid) {
            angular.extend(vm.entityOptions.entityData, {
              createLink: 'keys.create',
              createLinkText: 'Add SSH Key'
            });
          }
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

(function() {
  angular.module('ncsaas')
    .controller('UserDeleteTabController', [
      'baseControllerClass',
      '$state',
      UserDeleteTabController
    ]);

  function UserDeleteTabController(
    baseControllerClass,
    $state
  ) {
    var controllerScope = this;
    var DeleteController = baseControllerClass.extend({
      init: function() {
        this.controllerScope = controllerScope;
        this._super();
      },
      removeUser: function () {
        $state.go('support.create', {type: 'remove_user'});
      }
    });

    controllerScope.__proto__ = new DeleteController();
  }

})();
