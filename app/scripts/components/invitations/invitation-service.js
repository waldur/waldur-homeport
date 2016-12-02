const invitationStorageToken = 'ncInvitationToken';

export default function invitationService(baseServiceClass, $http, ENV, $window) {
  /*jshint validthis: true */
  var ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/user-invitations/';
    },
    check: function(invitation_uuid) {
      return this.executeAction(invitation_uuid, 'check');
    },
    accept: function(invitation_uuid) {
      return this.executeAction(invitation_uuid, 'accept');
    },
    cancel: function(invitation_uuid) {
      return this.executeAction(invitation_uuid, 'cancel');
    },
    resend: function(invitation_uuid) {
      return this.executeAction(invitation_uuid, 'send');
    },
    executeAction: function(invitation_uuid, action) {
      var url = ENV.apiEndpoint + '/api/user-invitations/' + invitation_uuid + '/' + action + '/';
      return $http.post(url);
    },
    setInvitationToken: function(invitationUUID) {
      if (invitationUUID) {
        $window.localStorage[invitationStorageToken] = invitationUUID;
      }
    },
    getInvitationToken: function() {
      return $window.localStorage[invitationStorageToken];
    },
    clearInvitationToken: function() {
      $window.localStorage.removeItem(invitationStorageToken);
    }
  });
  return new ServiceClass();
}
