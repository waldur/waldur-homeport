// @ngInject
export default function issueUsersService(baseServiceClass) {
  var ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/support-users/';
    }
  });
  return new ServiceClass();
}
