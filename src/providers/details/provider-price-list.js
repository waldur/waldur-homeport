const providerPriceList = {
  bindings: {
    provider: '<'
  },
  templateUrl: 'views/partials/filtered-list.html',
  controllerAs: 'ListController',
  controller: ProviderPriceListController,
};

export default providerPriceList;

// @ngInject
function ProviderPriceListController(
  baseControllerListClass,
  priceListItemsService,
  servicesService,
  usersService,
  customersService,
  $filter) {
  let controllerScope = this;
  let Controller = baseControllerListClass.extend({
    init: function() {
      this.service = priceListItemsService;
      this._super();
      this.isEditable().then(() => {
        this.tableOptions = {
          disableSearch: true,
          disableAutoUpdate: true,
          noDataText: gettext('No price list items yet.'),
          noMatchesText: gettext('No price list items found matching filter.'),
          columns: [
            {
              title: gettext('Resource type'),
              render: row => row.resource_type,
            },
            {
              title: gettext('Item type'),
              render: row => row.item_type,
            },
            {
              title: gettext('Key'),
              render: row => row.key,
            },
            {
              title: gettext('Hourly rate'),
              render: row => $filter('defaultCurrency')(row.value)
            }
          ]
        };
      });
    },
    isEditable: function() {
      return servicesService.getServicesList().then(services => {
        // Prices for public providers can be edited via admin UI only
        if (services[controllerScope.provider.service_type].is_public_service) {
          return false;
        } else if (controllerScope.provider.shared) {
          // Prices for shared providers can be edited by staff only
          return usersService.currentUser.is_staff;
        } else {
          // Prices for own providers can be edited by customer owner and staff only
          return customersService.isOwnerOrStaff();
        }
      });
    },
    editInPlace: function(priceListItem, value) {
      return this.service.updateOrCreate(priceListItem, controllerScope.provider.url, value);
    },
    getFilter: function() {
      return {
        service_type: controllerScope.provider.service_type,
        service_uuid: controllerScope.provider.uuid
      };
    },
  });
  controllerScope.__proto__ = new Controller();
}
