// @ngInject
export default function costPresetsService(baseServiceClass) {
  var ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/deployment-presets/';
    }
  });
  return new ServiceClass();
}
