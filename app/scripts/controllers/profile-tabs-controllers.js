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
