import template from './provider-prices.html';

export default function providerPrices() {
  return {
    restrict: 'E',
    scope: {
      serviceItem: '=provider'
    },
    template: template,
    controller: ProviderPricesController,
    controllerAs: 'PriceList'
  };
}

// @ngInject
function ProviderPricesController(
  baseControllerListClass,
  ENTITYLISTFIELDTYPES,
  priceListItemsService,
  servicesService,
  usersService,
  customersService,
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
          hideActions: true,
          hideControlButtons: true
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
      this.priceIsEditable = false;
      this.checkEditingPermissions();
    },
    checkEditingPermissions: function() {
      var vm = this;
      vm.isEditable().then(function(isEditable) {
        vm.priceIsEditable = isEditable;
        if (isEditable) {
          var hourlyRateColumn = vm.entityOptions.list[vm.entityOptions.list.length - 1];
          hourlyRateColumn.type = ENTITYLISTFIELDTYPES.editable;
        }
      })
    },
    isEditable: function() {
      var vm = this;
      return servicesService.getServicesList().then(function(services) {
        // Prices for public providers can be edited via admin UI only
        if (services[vm.serviceItem.service_type].is_public_service) {
          return false;
        } else if (vm.serviceItem.shared) {
          // Prices for shared providers can be edited by staff only
          return usersService.currentUser.is_staff;
        } else {
          // Prices for own providers can be edited by customer owner and staff only
          return customersService.isOwnerOrStaff();
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
