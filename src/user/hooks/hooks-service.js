// @ngInject
export default function hooksService(baseServiceClass, ENV) {
  const endpoints = {
    email: '/hooks-email/',
    webhook: '/hooks-web/',
  };

  const ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/hooks/';
    },
    getUrlByType: function(hook_type) {
      return ENV.apiEndpoint + 'api' + endpoints[hook_type];
    },
    getTypes: function() {
      return Object.keys(endpoints);
    },
    create: function(hook) {
      const url = this.getUrlByType(hook.hook_type);
      const instance = this.$create(url);
      this.cleanupOptions(hook, instance);
      return instance.$save();
    },
    update: function(hook) {
      const data = {};
      this.cleanupOptions(hook, data);
      return this.$update(null, hook.url, data);
    },
    cleanupOptions: function(input, output) {
      const fields = ['is_active', 'event_groups', 'email', 'destination_url'];
      for (const field of fields) {
        if (input[field] !== undefined) {
          output[field] = input[field];
        }
      }
    },
  });
  return new ServiceClass();
}
