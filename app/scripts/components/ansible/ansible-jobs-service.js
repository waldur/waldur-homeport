// @ngInject
export default function AnsibleJobsService(baseServiceClass) {
  let ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/ansible-jobs/';
    }
  });
  return new ServiceClass();
}
