// @ngInject
export default function usersService(baseServiceClass, $q, ENV, $rootScope) {
  let ServiceClass = baseServiceClass.extend({
    currentUser: null,
    init: function() {
      this._super();
      this.endpoint = '/users/';
    },

    setCurrentUser: function(user) {
      // TODO: Migrate to Redux and make code DRY
      $rootScope.$broadcast('CURRENT_USER_UPDATED', {user});
      this.currentUser = user;
    },

    resetCurrentUser: function() {
      this.currentUser = undefined;
    },

    getCurrentUser: function() {
      if (this.currentUser) {
        return $q.when(this.currentUser);
      }
      return this.getList({current:''}).then(response => {
        this.setCurrentUser(response[0]);
        return this.currentUser;
      });
    },

    isCurrentUserValid: function() {
      return this.getCurrentUser().then(user => {
        return !this.mandatoryFieldsMissing(user) && user.agreement_date;
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
