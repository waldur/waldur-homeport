// @ngInject
export default function packageTemplatesService(baseServiceClass) {
  var ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/package-templates/';
      this.filterByCustomer = false;
    }
  });
  return new ServiceClass();
}
