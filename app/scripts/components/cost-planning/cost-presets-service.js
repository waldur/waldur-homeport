// @ngInject
export default function costPresetsService(baseServiceClass) {
  var ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/deployment-presets/';
      this.pushPostprocessor(preset => {
        preset.disk = preset.storage;
        return preset;
      });
    }
  });
  return new ServiceClass();
}
