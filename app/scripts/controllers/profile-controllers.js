'use strict';

(function() {
  angular.module('ncsaas')
    .controller('DetailUpdateProfileController', [
      'baseUserDetailUpdateController',
      'usersService',
      'ENV',
      '$stateParams',
      DetailUpdateProfileController
    ]);

  function DetailUpdateProfileController(
    baseUserDetailUpdateController,
    usersService,
    ENV,
    $stateParams) {
    var controllerScope = this;
    var Controller = baseUserDetailUpdateController.extend({
      init:function() {
        this.controllerScope = controllerScope;
        this._super();
        this.detailsState = 'profile.details';
        this.showImport = ENV.showImport;
        this.tab = $stateParams.tab;
      },
      activate: function() {
        var vm = this;
        usersService.getCurrentUser().then(function(response) {
          vm.model = response;
        });
      }
    });

    controllerScope.__proto__ = new Controller();
  }
})();

(function() {
  angular.module('ncsaas').filter('titleCase', function() {
    return function(input) {
      return input.charAt(0).toUpperCase() + input.slice(1);
    }
  })
})();

(function() {
  angular.module('ncsaas')
    .controller('HookListController', [
      'baseControllerListClass',
      'hooksService',
      'ENTITYLISTFIELDTYPES',
      HookListController
    ]);

  function HookListController(
    baseControllerListClass,
    hooksService,
    ENTITYLISTFIELDTYPES) {
    var controllerScope = this;
    var Controller = baseControllerListClass.extend({
      init: function() {
        this.controllerScope = controllerScope;
        this.service = hooksService;
        this._super();

        this.actionButtonsListItems = [
          {
            title: 'Remove',
            clickFunction: this.remove.bind(this.controllerScope),
            className: 'remove'
          }
        ];

        this.entityOptions = {
          entityData: {
            noDataText: 'No notifications yet',
            createLink: 'profile.hook-create',
            createLinkText: 'Create notification method',
          },
          list: [
            {
              type: ENTITYLISTFIELDTYPES.statusCircle,
              propertyName: 'is_active',
              onlineStatus: true
            },
            {
              name: 'Notification method',
              propertyName: '$type',
              link: 'profile.hook-details({type: entity.$type, uuid: entity.uuid})',
              type: ENTITYLISTFIELDTYPES.name
            }
          ]
        };
      }
    });

    controllerScope.__proto__ = new Controller();
  }
})();


(function() {
  angular.module('ncsaas')
    .controller('HookCreateController', [
      'baseControllerAddClass',
      'hooksService',
      'eventRegistry',
      '$state',
      HookCreateController
    ]);

  function HookCreateController(
    baseControllerAddClass,
    hooksService,
    eventRegistry,
    $state) {
    var controllerScope = this;
    var Controller = baseControllerAddClass.extend({
      init: function() {
        this.controllerScope = controllerScope;
        this.service = hooksService;
        this._super();
        this.fillRows();
        this.types = hooksService.types();
        this.instance.$type = this.types[0];
      },
      fillRows: function() {
        var vm = this;
        this.rows = eventRegistry.entities.map(function(entity) {
          return {
            id: entity,
            selected: false
          }
        });
      },
      getEntities: function() {
        var entities = [];
        for (var i = 0; i < this.rows.length; i++) {
          var row = this.rows[i];
          if (row.selected) {
            entities.push(row.id);
          }
        }
        return entities;
      },
      beforeSave: function() {
        this.instance.event_types = eventRegistry.entities_to_types(this.getEntities());
      },
      successRedirect: function() {
        this.gotoList();
      },
      getSuccessMessage: function() {
        return 'Notification has been created';
      },
      cancel: function() {
        this.gotoList();
      },
      gotoList: function() {
        $state.go('profile.details', {'tab': 'notifications'});
      }
    });

    controllerScope.__proto__ = new Controller();
  }
})();

(function() {
  angular.module('ncsaas')
    .controller('HookUpdateController', [
      'baseControllerDetailUpdateClass',
      'hooksService',
      'eventRegistry',
      '$state',
      '$stateParams',
      HookUpdateController
    ]);

  function HookUpdateController(
    baseControllerDetailUpdateClass,
    hooksService,
    eventRegistry,
    $state,
    $stateParams) {
    var controllerScope = this;
    var Controller = baseControllerDetailUpdateClass.extend({
      init: function() {
        this.controllerScope = controllerScope;
        this.service = hooksService;
        this._super();
      },
      getModel: function() {
        return hooksService.$get($stateParams.type, $stateParams.uuid);
      },
      afterActivate: function() {
        this.fillRows();
      },
      fillRows: function() {
        var entities = eventRegistry.types_to_entities(this.model.event_types);
        this.rows = eventRegistry.entities.map(function(entity) {
          return {
            id: entity,
            selected: entities.indexOf(entity) != -1
          }
        });
      },
      getEntities: function() {
        var entities = [];
        for (var i = 0; i < this.rows.length; i++) {
          var row = this.rows[i];
          if (row.selected) {
            entities.push(row.id);
          }
        }
        return entities;
      },
      beforeUpdate: function() {
        this.model.event_types = eventRegistry.entities_to_types(this.getEntities());
      },
      successRedirect: function() {
        this.gotoList();
      },
      cancel: function() {
        this.gotoList();
      },
      gotoList: function() {
        $state.go('profile.details', {'tab': 'notifications'});
      }
    });

    controllerScope.__proto__ = new Controller();
  }
})();
