// @ngInject
export default function keysService(baseServiceClass) {
  var ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/keys/';
    }
  });
  return new ServiceClass();
}
