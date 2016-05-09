'use strict';

(function() {

  angular.module('ncsaas')
    .controller('ServicePriceListController', [
      'baseControllerListClass',
      'ENTITYLISTFIELDTYPES',
      'priceListItemsService',
      'servicesService',
      '$q',
      '$scope',
      ServicePriceListController
    ]);

  function ServicePriceListController(
    baseControllerListClass,
    ENTITYLISTFIELDTYPES,
    priceListItemsService,
    servicesService,
    $q,
    $scope) {
    var controllerScope = this;
    var Controller = baseControllerListClass.extend({
      init: function() {
        this.serviceItem = $scope.serviceItem;
        this.service = priceListItemsService;
        this._super();
        this.entityOptions = {
          entityData: {
            noDataText: 'No price list items yet.',
            noMatchesText: 'No price list items found matching filter.',
            rowTemplateUrl: 'views/directives/service-prices-mobile.html'
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
              type: ENTITYLISTFIELDTYPES.editable,
              emptyText: '0.00'
            }
          ]
        };
        this.disablePriceListUpdateForPublicServices()
      },
      disablePriceListUpdateForPublicServices: function() {
        var vm = this;
        servicesService.getServicesList().then(function(services) {
          if (services[vm.serviceItem.service_type].is_public_service) {
            var hourlyRateColumn = vm.entityOptions.list[vm.entityOptions.list.length - 1];
            hourlyRateColumn.type = ENTITYLISTFIELDTYPES.noType;
          }
        });
      },
      editInPlace: function(priceListItem, value) {
        return this.service.updateOrCreate(priceListItem, this.serviceItem.url, value);
      },
      getList: function(filter) {
        this.service.defaultFilter.service_type = this.serviceItem.service_type;
        this.service.defaultFilter.service_uuid = this.serviceItem.uuid;
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
        serviceItem: '=service'
      },
      templateUrl: 'views/directives/service-prices.html',
      controller: ServicePriceListController,
      controllerAs: 'PriceList'
    };
  }

})();
