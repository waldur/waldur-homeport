// @ngInject
export default function alertsService(baseServiceClass, ENV) {
  let ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/alerts/';
    },
    setDefaultFilter: function() {
      // New alerts first
      this.defaultFilter = {
        opened: true,
        o: '-created'
      };
      if (!ENV.featuresVisible) {
        this.defaultFilter.exclude_features = ENV.toBeFeatures;
      }
    },
  });
  return new ServiceClass();
}
