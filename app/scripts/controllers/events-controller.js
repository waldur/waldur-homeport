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
            title: 'Organization creation',
            value: EVENTTYPE.customer_creation_succeeded
          }
        ];
        this.actionButtonsListItems = [
          {
            title: 'Some action for this type',
            clickFunction: function() {}
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
          EVENTTYPE.user_activated,
          EVENTTYPE.user_deactivated,
          EVENTTYPE.user_password_updated
        ];
        return ~typesReady.indexOf(type);
      }
    });

    return ControllerListClass;
  }

  angular.module('ncsaas')
    .controller('EventListController', ['baseEventListController', 'ENV', EventListController]);

  function EventListController(baseEventListController, ENV) {
    var controllerScope = this;
    var EventController = baseEventListController.extend({
      init:function() {
        this.controllerScope = controllerScope;
        this.cacheTime = ENV.dashboardEventsCacheTime;
        this._super();
      }
    });

    controllerScope.__proto__ = new EventController();
  }
  angular.module('ncsaas')
    .controller('DemoEventListController', ['baseEventListController', 'ENV', DemoEventListController]);

  function DemoEventListController(baseEventListController, ENV) {
    var controllerScope = this;
    var EventController = baseEventListController.extend({
      init:function() {
        this.controllerScope = controllerScope;
        this.cacheTime = ENV.dashboardEventsCacheTime;
        this._super();
        this.activeTab = 'activity';
        this.data = {
          labels: ["Monday", "Tuesday", "Wednsday", "Thursday", "Friday", "Saturday", "Sunday"],
          datasets: [
            {
              label: "Events",
              fillColor: "rgba(220,220,220,0.2)",
              strokeColor: "rgba(220,220,220,1)",
              pointColor: "rgba(220,220,220,1)",
              pointStrokeColor: "#fff",
              pointHighlightFill: "#fff",
              pointHighlightStroke: "rgba(220,220,220,1)",
              data: [65, 59, 80, 81, 56, 55, 40]
            }
          ]
        };
        this.costData = {
          labels: ["January", "February", "March", "April", "May", "June", "July"],
          datasets: [
            {
              label: "Events",
              fillColor: "rgba(123, 166, 196,0.5)",
              strokeColor: "rgba(123, 166, 196,1)",
              pointColor: "rgba(123, 166, 196,1)",
              pointStrokeColor: "#fff",
              pointHighlightFill: "#fff",
              pointHighlightStroke: "rgba(123, 166, 196,1)",
              data: [0, 59, 80, 81, 56, 55, 40]
            },
            {
              label: "Alerts",
              fillColor: "rgba(206, 230, 174,0.5)",
              strokeColor: "rgba(206, 230, 174,1)",
              pointColor: "rgba(206, 230, 174,1)",
              pointStrokeColor: "#fff",
              pointHighlightFill: "#fff",
              pointHighlightStroke: "rgba(206, 230, 174,1)",
              data: [0, 48, 40, 19, 86, 27, 90]
            }
          ]
        };

        this.chartOptions = {
          responsive: true,
          scaleShowVerticalLines: false,
          scaleShowGridLines: false,
          bezierCurve: false
        };
      }
    });

    controllerScope.__proto__ = new EventController();
  }
})();
