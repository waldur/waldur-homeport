// @ngInject
export default function usersService(baseServiceClass, $q, ENV) {
  var ServiceClass = baseServiceClass.extend({
    currentUser: null,
    init: function() {
      this._super();
      this.endpoint = '/users/';
    },
    getCurrentUser: function() {
      if (this.currentUser) {
        return $q.when(this.currentUser);
      }
      return this.getList({current:''}).then(response => {
        this.currentUser = response[0];
        return this.currentUser;
      });
    },

    mandatoryFieldsMissing: function(user) {
      return ENV.userMandatoryFields.reduce(
        (result, item) => result || !user[item], false);
    },

    getCounters: function(query) {
      return this.getFactory(false, '/user-counters/').get(query).$promise;
    }
  });
  return new ServiceClass();
}
