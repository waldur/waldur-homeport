// @ngInject
export default function keysService(baseServiceClass) {
  let ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/keys/';
    }
  });
  return new ServiceClass();
}
