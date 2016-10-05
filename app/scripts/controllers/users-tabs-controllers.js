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
      'currentUser',
      '$state',
      UserKeyTabController
    ]);

  function UserKeyTabController(
    $stateParams,
    keysService,
    baseControllerListClass,
    currentUser,
    $state) {
    var controllerScope = this;
    var Controller = baseControllerListClass.extend({
      init: function() {
        this.controllerScope = controllerScope;
        this.service = keysService;
        this._super();

        this.tableOptions = {
          searchFieldName: 'name',
          noDataText: 'No SSH keys yet.',
          noMatchesText: 'No SSH keys found matching filter.',
          columns: [
            {
              title: 'Title',
              render: function(data, type, row, meta) {
                return row.name;
              }
            },
            {
              title: 'Fingerprint',
              render: function(data, type, row, meta) {
                return row.fingerprint;
              }
            }
          ],
          rowActions: this.getRowActions(),
          tableActions: this.getTableActions()
        };
      },
      getRowActions: function() {
        if (this.isStaffOrSelf()) {
          return [
            {
              name: '<i class="fa fa-trash"></i> Remove',
              callback: this.remove.bind(controllerScope)
            }
          ];
        }
      },
      getTableActions: function() {
        if (this.isStaffOrSelf()) {
          return [
            {
              name: '<i class="fa fa-plus"></i> Add SSH key',
              callback: function() {
                $state.go('keys.create');
              }
            }
          ];
        }
      },
      isStaffOrSelf: function() {
        return angular.isUndefined($stateParams.uuid) ||
               currentUser.uuid === $stateParams.uuid ||
               currentUser.is_staff;
      },
      getList: function(filter) {
        this.service.defaultFilter.user_uuid = $stateParams.uuid || currentUser.uuid;
        return this._super(filter);
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
