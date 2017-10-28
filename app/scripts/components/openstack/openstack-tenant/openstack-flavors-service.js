// @ngInject
export default function openstackFlavorsService(baseServiceClass) {
  let ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/openstacktenant-flavors/';
    }
  });
  return new ServiceClass();
}
