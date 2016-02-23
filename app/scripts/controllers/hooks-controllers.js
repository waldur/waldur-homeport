'use strict';

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
        this.blockUIElement = 'tab-content';
        this._super();

        this.actionButtonsListItems = [
          {
            title: 'Remove',
            icon: 'fa-trash',
            clickFunction: this.remove.bind(this.controllerScope),
            className: 'remove'
          }
        ];

        this.entityOptions = {
          entityData: {
            noDataText: 'No notifications registered',
            createLink: 'profile.hook-create',
            createLinkText: 'Add notification',
            rowTemplateUrl: 'views/user/hook-row.html'
          },
          list: [
            {
              type: ENTITYLISTFIELDTYPES.statusCircle,
              propertyName: 'is_active',
              onlineStatus: true,
              className: 'statusCircle'
            },
            {
              type: ENTITYLISTFIELDTYPES.name,
              propertyName: 'label',
              name: 'Method',
              link: 'profile.hook-details({type: entity.hook_type, uuid: entity.uuid})'
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

      removeInstance: function(hook) {
        return this.service.$deleteByUrl(hook.url);
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
          item.label = $filter('titleCase')(item.hook_type);
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
        this.types = hooksService.getTypes();
        this.instance.hook_type = 'webhook';
      },
      fillRows: function() {
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
      saveInstance: function() {
        var url = this.service.getUrlByType(this.instance.hook_type);
        var event_types = eventRegistry.entities_to_types(this.getEntities());
        var options = angular.extend({event_types: event_types}, this.instance);
        return this.service.create(url, options);
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
        var url = this.service.getUrlByType($stateParams.type);
        return hooksService.$get($stateParams.uuid, url);
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
      updateInstance: function() {
        var url = this.model.url;
        var event_types = eventRegistry.entities_to_types(this.getEntities());
        var options = angular.extend({}, this.model, {event_types: event_types});
        return this.service.update(url, options);
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
