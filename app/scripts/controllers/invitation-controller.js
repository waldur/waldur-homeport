(function() {

  angular.module('ncsaas')
    .controller('InvitationController', InvitationController);
  
  InvitationController.$inject = ['baseControllerClass', 'ENV', '$state', '$timeout', '$window'];

  function InvitationController(
    baseControllerClass,
    ENV,
    $state,
    $timeout,
    $window) {
    var controllerScope = this;
    var Controller = baseControllerClass.extend({
      init: function() {
        var invitationUUID = $state.params.uuid;
        this.setInvitationToken(invitationUUID);
        this._super();
      },
      setInvitationToken: function(invitationUUID) {
        if (invitationUUID) {
          $window.localStorage[ENV.invitationStorageToken] = invitationUUID;
        }
        $timeout(function() {
          $state.go('register');
        }, ENV.invitationRedirectTime);
      }
    });

    controllerScope.__proto__ = new Controller();
  }

})();
