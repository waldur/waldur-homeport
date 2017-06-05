// @ngInject
export default function freeipaService($http, ENV) {
  const endpoint = `${ENV.apiEndpoint}api/freeipa-profiles/`;

  let createProfile = function (username, agreeWithPolicy){
    return $http.post(endpoint, {username, agree_with_policy: agreeWithPolicy});
  };

  let getProfile = function(username) {
    return $http.get(endpoint, {params: {username: username}});
  };

  function resourceAction(uuid, action) {
    let url = `${endpoint}${uuid}/${action}/`;
    return $http.post(url);
  }

  let enable = function(uuid) {
    return resourceAction(uuid, 'enable');
  };

  let disable = function(uuid) {
    return resourceAction(uuid, 'disable');
  };

  let sync = function(uuid) {
    return resourceAction(uuid, 'update_ssh_keys');
  };

  return {
    createProfile: createProfile,
    enableProfile: enable,
    disableProfile: disable,
    syncProfile: sync,
    getProfile: getProfile,
  };
}
