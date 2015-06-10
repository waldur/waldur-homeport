(function() {
  angular.module('ncsaas')
    .controller('KeyAddController', ['baseControllerAddClass', 'keysService', '$state', KeyAddController]);

  function KeyAddController(baseControllerAddClass, keysService, $state) {
    var controllerScope = this;
    var Controller = baseControllerAddClass.extend({
      init: function() {
        this.service = keysService;
        this.controllerScope = controllerScope;
        this._super();
        this.listState = 'profile.details';
      },
      successRedirect: function() {
        $state.go('profile.details', {tab: 'keys'});
      }
    });

    controllerScope.__proto__ = new Controller();
  }
})();