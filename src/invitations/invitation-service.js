import Axios from 'axios';

const invitationStorageToken = 'ncInvitationToken';

// @ngInject
export default function invitationService(baseServiceClass, ENV, $window) {
  const ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/user-invitations/';
    },
    check: function(invitation_uuid) {
      return this.executeAction(invitation_uuid, 'check');
    },
    accept: function(invitation_uuid, replace_email) {
      return this.executeAction(invitation_uuid, 'accept', {
        replace_email: replace_email,
      });
    },
    cancel: function(invitation_uuid) {
      return this.executeAction(invitation_uuid, 'cancel');
    },
    resend: function(invitation_uuid) {
      return this.executeAction(invitation_uuid, 'send');
    },
    approve: function(token) {
      return Axios.post(`${ENV.apiEndpoint}api/user-invitations/approve/`, {
        token,
      });
    },
    reject: function(token) {
      return Axios.post(`${ENV.apiEndpoint}api/user-invitations/reject/`, {
        token,
      });
    },
    executeAction: function(invitation_uuid, action, data) {
      return Axios.post(
        `${ENV.apiEndpoint}api/user-invitations/${invitation_uuid}/${action}/`,
        data,
      );
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
    },
  });
  return new ServiceClass();
}
