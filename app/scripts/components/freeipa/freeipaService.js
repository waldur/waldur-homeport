export default class FreeIPAService{
  // @ngInject
  constructor($http, ENV) {
    this.endpoint = `${ENV.apiEndpoint}api/freeipa-profiles/`;
    this.$http = $http;
  }

  createProfile(username, agreeWithPolicy){
    return this.$http.post(this.endpoint, {username, agree_with_policy: agreeWithPolicy});
  }

  getProfile(user) {
    return this.$http.get(this.endpoint, {params: {user: user.uuid}});
  }

  resourceAction(uuid, action) {
    let url = `${this.endpoint}${uuid}/${action}/`;
    return this.$http.post(url);
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
