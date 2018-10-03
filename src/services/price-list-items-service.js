// @ngInject
export default function priceListItemsService(baseServiceClass, $http, ENV) {
  let ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/merged-price-list-items/';
    },
    updateOrCreate: function(priceListItem, serviceUrl, value) {
      if (priceListItem.service_price_list_item_url) {
        return $http.patch(priceListItem.service_price_list_item_url, {
          value: value
        });
      } else {
        return $http.post(ENV.apiEndpoint + 'api/service-price-list-items/', {
          default_price_list_item: priceListItem.url,
          service: serviceUrl,
          value: value
        }).then(function(response) {
          priceListItem.service_price_list_item_url = response.data.url;
          return response.data;
        });
      }
    }
  });
  return new ServiceClass();
}
