// @ngInject
export default function defaultPriceListItemsService(baseServiceClass) {
  var ServiceClass = baseServiceClass.extend({
    init:function() {
      this._super();
      this.endpoint = '/default-price-list-items/';
    }
  });
  return new ServiceClass();
}
