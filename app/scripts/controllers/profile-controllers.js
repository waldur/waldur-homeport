'use strict';

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
        this.tab = $stateParams.tab;
      },
      activate: function() {
        var vm = this;
        usersService.getCurrentUser().then(function(response) {
          vm.model = response;
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
      '$filter',
      'hooksService',
      'eventRegistry',
      'ENTITYLISTFIELDTYPES',
      HookListController
    ]);

  function HookListController(
    baseControllerListClass,
    $filter,
    hooksService,
    eventRegistry,
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
            noDataText: 'No notifications registered',
            createLink: 'profile.hook-create',
            createLinkText: 'Add notification',
          },
          list: [
            {
              type: ENTITYLISTFIELDTYPES.statusCircle,
              propertyName: 'is_active',
              onlineStatus: true,
              className: 'statusCircle',
              showForMobile: ENTITYLISTFIELDTYPES.showForMobile
            },
            {
              type: ENTITYLISTFIELDTYPES.name,
              propertyName: 'label',
              name: 'Method',
              link: 'profile.hook-details({type: entity.$type, uuid: entity.uuid})',
              showForMobile: ENTITYLISTFIELDTYPES.showForMobile
            },
            {
              type: ENTITYLISTFIELDTYPES.noType,
              propertyName: 'destination',
              name: 'Destination'
            },
            {
              type: ENTITYLISTFIELDTYPES.listInField,
              propertyName: 'entities',
              name: 'Events'
            }
          ]
        };
      },

      search: function() {
        var vm = this,
            searchInput = vm.searchInput.toLowerCase();

        vm.list = vm.service.list.filter(function(item) {
          if (
            item.label.toLowerCase().indexOf(searchInput) >= 0
            || item.destination.toLowerCase().indexOf(searchInput) >= 0
          ) {
            return item;
          }
        });
      },

      afterGetList: function() {
        this.list.forEach(function(item) {
          item.label = $filter('titleCase')(item.$type);
          item.destination = item.destination_url || item.email;
          item.entities = eventRegistry.types_to_entities(item.event_types);
        });
        this.service.list = this.list;
      }
    });
    Object.setPrototypeOf(controllerScope, new Controller());
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
        $state.go('profile.details', {tab: 'notifications'});
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
