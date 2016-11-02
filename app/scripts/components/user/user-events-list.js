// @ngInject
export default function UserEventsListController(
  $stateParams, usersService, baseEventListController) {
  var controllerScope = this;
  var EventController = baseEventListController.extend({
    user: null,

    init: function() {
      this.controllerScope = controllerScope;
      this._super();
    },
    getList: function(filter) {
      var vm = this,
        fn = this._super.bind(this);

      return this.getUser().then(function(user) {
        vm.user = user;
        vm.service.defaultFilter.scope = user.url;
        return fn(filter);
      });
    },
    getUser: function() {
      if ($stateParams.uuid) {
        return usersService.$get($stateParams.uuid);
      } else {
        return usersService.getCurrentUser();
      }
    }
  });

  controllerScope.__proto__ = new EventController();
}
