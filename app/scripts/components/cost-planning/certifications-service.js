// @ngInject
export default function certificationsService(baseServiceClass) {
  var ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/service-certifications/';
    }
  });
  return new ServiceClass();
}
