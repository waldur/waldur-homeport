'use strict';

(function() {
  angular.module('ncsaas')
    .service('baseEventListController', [
      'baseControllerListClass', 'eventsService', 'EVENTTYPE', baseEventListController]);

  function baseEventListController(baseControllerListClass, eventsService, EVENTTYPE) {
    var ControllerListClass = baseControllerListClass.extend({
      EVENTTYPE: EVENTTYPE,

      init:function() {
        this.service = eventsService;
        this.searchFieldName = 'search';
        this.searchFilters = [
          {
            name: 'event_type',
            title: 'Logged in',
            value: EVENTTYPE.auth_logged_in_with_username
          },
          {
            name: 'event_type',
            title: 'Project creation',
            value: EVENTTYPE.project_creation_succeeded
          },
          {
            name: 'event_type',
            title: 'Customer creation',
            value: EVENTTYPE.customer_creation_succeeded
          }
        ];
        this._super();
      },
      isTemplateTypeReady: function(type) {
        var typesReady = [
          EVENTTYPE.auth_logged_in_with_username,
          EVENTTYPE.role_granted,
          EVENTTYPE.role_granted_structure_type_project,
          EVENTTYPE.role_granted_structure_type_customer,
          EVENTTYPE.user_update_succeeded,
          EVENTTYPE.project_creation_succeeded,
          EVENTTYPE.iaas_service_sync_failed,
          EVENTTYPE.iaas_instance_creation_scheduled,
          EVENTTYPE.customer_creation_succeeded,
          EVENTTYPE.project_group_creation_succeeded,
          EVENTTYPE.customer_update_succeeded,
          EVENTTYPE.user_password_updated
        ];
        return ~typesReady.indexOf(type);
      }
    });

    return ControllerListClass;
  }

  angular.module('ncsaas')
    .controller('EventListController', ['baseEventListController', EventListController]);

  function EventListController(baseEventListController) {
    var controllerScope = this;
    var EventController = baseEventListController.extend({
      init:function() {
        this.controllerScope = controllerScope;
        this._super();
      }
    });

    controllerScope.__proto__ = new EventController();
  }
})();
