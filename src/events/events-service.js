// @ngInject
export default function eventsService($q, baseServiceClass) {
  const ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/events/';
    },
    setDefaultFilter: function() {
      this.defaultFilter = { exclude_extra: true };
    },
  });
  return new ServiceClass();
}
