import Axios from 'axios';

export default class FreeIPAService {
  // @ngInject
  constructor(ENV) {
    this.endpoint = `${ENV.apiEndpoint}api/freeipa-profiles/`;
  }

  createProfile(username, agreeWithPolicy) {
    return Axios.post(this.endpoint, {
      username,
      agree_with_policy: agreeWithPolicy,
    });
  }

  resourceAction(uuid, action) {
    const url = `${this.endpoint}${uuid}/${action}/`;
    return Axios.post(url);
  }

  enableProfile(uuid) {
    return this.resourceAction(uuid, 'enable');
  }

  disableProfile(uuid) {
    return this.resourceAction(uuid, 'disable');
  }

  syncProfile(uuid) {
    return this.resourceAction(uuid, 'update_ssh_keys');
  }
}
