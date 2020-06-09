import { post } from '@waldur/core/api';

export const FreeIPAService = {
  createProfile(username, agreeWithPolicy) {
    return post('/freeipa-profiles/', {
      username,
      agree_with_policy: agreeWithPolicy,
    });
  },

  enableProfile(uuid) {
    return post(`/freeipa-profiles/${uuid}/enable/`);
  },

  disableProfile(uuid) {
    return post(`/freeipa-profiles/${uuid}/disable/`);
  },

  syncProfile(uuid) {
    return post(`/freeipa-profiles/${uuid}/update_ssh_keys/`);
  },
};
