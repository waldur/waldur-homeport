'use strict';

(function() {

  angular.module('ncsaas')
    .controller('ServicePriceListController', [
      'baseControllerListClass',
      'ENTITYLISTFIELDTYPES',
      'priceListItemsService',
      '$q',
      '$attrs',
      '$parse',
      '$scope',
      ServicePriceListController
    ]);

  function ServicePriceListController(
    baseControllerListClass,
    ENTITYLISTFIELDTYPES,
    priceListItemsService,
    $q,
    $attrs,
    $parse,
    $scope) {
    var controllerScope = this;
    var Controller = baseControllerListClass.extend({
      init: function() {
        this.serviceItem = $parse($attrs.service)($scope);
        this.service = priceListItemsService;
        this._super();
        this.entityOptions = {
          entityData: {
            noDataText: 'No price list items yet.',
            noMatchesText: 'No price list items found matching filter.',
          },
          list: [
            {
              name: 'Resource type',
              propertyName: 'resource_type',
              type: ENTITYLISTFIELDTYPES.noType
            },
            {
              name: 'Item type',
              propertyName: 'item_type',
              type: ENTITYLISTFIELDTYPES.noType
            },
            {
              name: 'Key',
              propertyName: 'key',
              type: ENTITYLISTFIELDTYPES.noType
            },
            {
              name: 'Hourly rate',
              propertyName: 'value',
              type: ENTITYLISTFIELDTYPES.noType,
              emptyText: '0.00'
            }
          ]
        };
        this.actionButtonsListItems = [
          {
            title: 'Edit',
            icon: 'fa-pencil-square-o',
            clickFunction: this.edit.bind(controllerScope)
          }
        ];
      },
      edit: function() {
        alert('Edit');
      },
      getList: function(filter) {
        filter = filter || {};
        filter = angular.extend({
          service_type: this.serviceItem.service_type,
          service_uuid: this.serviceItem.uuid
        }, filter);
        return this._super(filter);
      },
    });
    controllerScope.__proto__ = new Controller();
  }

  angular.module('ncsaas')
    .directive('servicePrices', [servicePrices]);

  function servicePrices() {
    return {
      restrict: 'AE',
      scope: {
        service: '='
      },
      templateUrl: 'views/directives/service-prices.html'
    };
  }

})();
