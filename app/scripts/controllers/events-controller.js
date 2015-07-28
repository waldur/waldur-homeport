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
    .controller('EventListController', [
      '$scope',
      'baseEventListController',
      'currentStateService',
      'ENV',
      EventListController]);

  function EventListController(
    $scope,
    baseEventListController,
    currentStateService,
    ENV) {
    var controllerScope = this;
    var EventController = baseEventListController.extend({
      init:function() {
        this.controllerScope = controllerScope;
        this.cacheTime = ENV.dashboardEventsCacheTime;
        this._super();

        $scope.$on('currentCustomerUpdated', this.onCustomerUpdate.bind(this));
      },

      onCustomerUpdate: function() {
        this.getList();
      },

      getList: function(filter) {
        var vm = this;
        var fn = this._super.bind(vm);
        filter = filter || {};
        currentStateService.getCustomer().then(function(customer){
          filter['scope'] = customer.url;
          vm.service.defaultFilter.scope = customer.url;
          fn(filter);
        })
      }
    });

    controllerScope.__proto__ = new EventController();
  }
  angular.module('ncsaas')
    .controller('DashboardIndexController', [
      '$scope',
      'baseEventListController',
      'projectsService',
      'alertsService',
      'eventsService',
      'eventStatisticsService',
      'resourcesCountService',
      'currentStateService',
      'ENV',
      DashboardIndexController]);

  function DashboardIndexController(
    $scope,
    baseEventListController,
    projectsService,
    alertsService,
    eventsService,
    eventStatisticsService,
    resourcesCountService,
    currentStateService,
    ENV) {
    var controllerScope = this;
    var EventController = baseEventListController.extend({
      init:function() {
        this.controllerScope = controllerScope;
        this.cacheTime = ENV.dashboardEventsCacheTime;
        this._super();
        this.activeTab = 'activity';
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

        $scope.$on('currentCustomerUpdated', this.onCustomerUpdate.bind(this));
        this.onCustomerUpdate();
      },

      onCustomerUpdate: function() {
        this.getCustomerProjects();
        this.getCustomerEvents();
        this.getCustomerAlerts();
      },

      getCustomerAlerts: function () {
        var vm = this;
        currentStateService.getCustomer().then(function(customer) {
          alertsService.getList({'aggregate': 'customer', 'uuid': customer.uuid}).then(function(response){
            vm.alerts = response;
          })
        })
      },

      getCustomerEvents: function () {
        var vm = this;
        currentStateService.getCustomer().then(function(customer) {
          eventsService.getList({'scope': customer.url}).then(function(response){
            vm.events = response;
          })
        })
      },

      getCustomerProjects: function() {
        var vm = this;
        projectsService.getList().then(function(response) {
          vm.projects = response;
          vm.projects.forEach(function(project){
            vm.getProjectResources(project);
            vm.getProjectEvents(project);
          })
        });
      },

      getProjectResources: function (project) {
        project.count = {};
        project.count.services = project.services.length;
        resourcesCountService.users({'project': project.uuid}).then(function(count) {
          project.count.users = count;
        })
        resourcesCountService.resources({'project_uuid': project.uuid}).then(function(count) {
          project.count.resources = count;
        })
        resourcesCountService.alerts({'scope': project.url}).then(function(count) {
          project.count.alerts = count;
        })
      },

      getProjectEvents: function (project) {
        var end = moment.utc().unix();
        var start = moment.utc().subtract(1, 'week').unix();
        eventStatisticsService.getList({
          'scope': project.url,
          'start': start,
          'end': end,
          'points_count': 7 // days in week
        }).then(function(response){
          var labels = [];
          var points = [];
          for (var i = 0; i < response.length; i++) {
            var date = moment.unix(response[i].point);
            var day = date.format('dddd');
            var value = response[i].object.count;
            labels.push(day);
            points.push(value);
          };

          project.chartData = {
            labels: labels,
            datasets: [
              {
                label: "Events",
                fillColor: "rgba(220,220,220,0.2)",
                strokeColor: "rgba(220,220,220,1)",
                pointColor: "rgba(220,220,220,1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(220,220,220,1)",
                data: points
              }
            ]
          };
        })
      }
    });

    controllerScope.__proto__ = new EventController();
  }
})();
