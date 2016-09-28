'use strict';

(function() {

  angular.module('ncsaas').service('EventDialogsService', EventDialogsService);

  EventDialogsService.$inject = ['$rootScope', '$uibModal']

  function EventDialogsService($rootScope, $uibModal) {
    this.eventTypes = function() {
      $uibModal.open({
        templateUrl: 'views/directives/alerts-dialog.html',
        controller: 'EventTypesController',
      });
    };

    this.alertTypes = function() {
      $uibModal.open({
        templateUrl: 'views/directives/alerts-dialog.html',
        controller: 'AlertTypesController',
      });
    };

    this.eventDetails = function(row) {
      var dialogScope = $rootScope.$new();
      dialogScope.expandableElement = row;
      $uibModal.open({
        templateUrl: 'views/directives/event-details-dialog.html',
        scope: dialogScope
      });
    };
  }

  angular.module('ncsaas').controller('EventTypesController', EventTypesController);
  EventTypesController.$inject = ['$scope', 'eventsService'];
  function EventTypesController($scope, eventsService) {
    $scope.type = 'Events';
    $scope.types = eventsService.getAvailableIconTypes();
  }

  angular.module('ncsaas').controller('AlertTypesController', AlertTypesController);
  AlertTypesController.$inject = ['$scope', 'alertsService'];
  function AlertTypesController($scope, alertsService) {
    $scope.type = 'Alerts';
    $scope.types = alertsService.getAvailableIconTypes();
  }

  angular.module('ncsaas')
    .service('baseEventListController', [
      'baseControllerListClass',
      'eventsService',
      'EventDialogsService',
      'eventFormatter',
      '$filter',
      baseEventListController]);

  function baseEventListController(
    baseControllerListClass,
    eventsService,
    EventDialogsService,
    eventFormatter,
    $filter) {
    var ControllerListClass = baseControllerListClass.extend({
      init:function() {
        this.service = eventsService;
        this.tableOptions = {
          noDataText: 'No events yet',
          noMatchesText: 'No events found matching filter.',
          searchFieldName: 'search',

          columns: [
            {
              title: 'Message',
              render: function(data, type, row, meta) {
                return eventFormatter.format(row);
              }
            },
            {
              title: 'Timestamp',
              render: function(data, type, row, meta) {
                return $filter('dateTime')(row['@timestamp']);
              }
            },
          ],

          tableActions: [
            {
              name: '<i class="fa fa-question-circle"></i> Event types',
              callback: EventDialogsService.eventTypes
            }
          ],

          rowActions: [
            {
              name: 'Details',
              callback: EventDialogsService.eventDetails
            }
          ]
        };
        this._super();
      },
    });

    return ControllerListClass;
  }

  angular.module('ncsaas')
    .service('BaseAlertsListController', [
      'baseControllerListClass',
      'alertsService',
      'alertFormatter',
      'EventDialogsService',
      '$filter',
      BaseAlertsListController]);

  function BaseAlertsListController(
    baseControllerListClass,
    alertsService,
    alertFormatter,
    EventDialogsService,
    $filter) {
    return baseControllerListClass.extend({
      init: function() {
        this.service = alertsService;
        this._super();

        this.tableOptions = {
          noDataText: 'No alerts yet',
          noMatchesText: 'No alerts found matching filter.',
          searchFieldName: 'message',
          columns: [
            {
              title: 'Message',
              render: function(data, type, row, meta) {
                return alertFormatter.format(row);
              }
            },
            {
            title: 'Timestamp',
              render: function(data, type, row, meta) {
                return $filter('dateTime')(row.created);
              }
            }
          ],
          tableActions: [
            {
              name: '<i class="fa fa-question-circle"></i> Alert types',
              callback: EventDialogsService.alertTypes
            }
          ]
        };
      }
    });
  }
})();
