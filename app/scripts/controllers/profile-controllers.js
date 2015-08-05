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
      'EVENTTYPE',
      '$state',
      HookCreateController
    ]);

  function HookCreateController(
    baseControllerAddClass,
    hooksService,
    EVENTTYPE,
    $state) {
    var controllerScope = this;
    var Controller = baseControllerAddClass.extend({
      init: function() {
        this.controllerScope = controllerScope;
        this.service = hooksService;
        this._super();
        this.getEventTypes();
        this.instance.$type = 'email';
      },

      getEventTypes: function() {
        var entities = [];
        var events = {};
        for(var event_type in EVENTTYPE) {
            var entity = event_type.split("_")[0];
            if (entities.indexOf(entity) == -1) {
              entities.push(entity);
              events[entity] = [];
            }
            events[entity].push(event_type);
        }
        entities.sort(function(a, b) {
          return a.localeCompare(b);
        });

        this.entities = [];
        for (var i = 0; i < entities.length; i++) {
          this.entities.push({
            id: entities[i],
            label: this.entityLabel(entities[i]),
            selected: false
          })
        }
      },

      entityLabel: function(entity) {
        return entity.charAt(0).toUpperCase() + entity.slice(1) + ' events';
      },

      updateEvents: function() {
        this.instance.event_types = [];
        for (var i = 0; i < this.entities.length; i++) {
          for(var event_type in EVENTTYPE) {
            if (event_type.startsWith(this.entities[i].id)) {
              this.instance.event_types.push(event_type);
            }
          }
        }
      },

      successRedirect: function() {
        $state.go('profile.details', {'tab': 'notifications'});
      }
    });

    controllerScope.__proto__ = new Controller();
  }
})();
