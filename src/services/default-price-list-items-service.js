// @ngInject
export default function defaultPriceListItemsService(baseServiceClass) {
  let ServiceClass = baseServiceClass.extend({
    init:function() {
      this._super();
      this.endpoint = '/default-price-list-items/';
    }
  });
  return new ServiceClass();
}
