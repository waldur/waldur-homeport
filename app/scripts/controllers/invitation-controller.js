(function() {

  angular.module('ncsaas')
    .controller('InvitationController', InvitationController);
  
  InvitationController.$inject = ['baseControllerClass', 'ENV', '$state', '$timeout', 'invitationService'];

  function InvitationController(
    baseControllerClass,
    ENV,
    $state,
    $timeout,
    invitationService) {
    var controllerScope = this;
    var Controller = baseControllerClass.extend({
      init: function() {
        if (!ENV.invitationsEnabled) {
          $state.go('errorPage.notFound');
          return;
        }
        var invitationUUID = $state.params.uuid;
        this.setInvitationToken(invitationUUID);
        this._super();
      },
      setInvitationToken: function(invitationUUID) {
        invitationService.setInvitationToken(invitationUUID);
        $timeout(function() {
          $state.go('register');
        }, ENV.invitationRedirectTime);
      }
    });

    controllerScope.__proto__ = new Controller();
  }

})();
