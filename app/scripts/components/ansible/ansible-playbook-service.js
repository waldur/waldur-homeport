export default class AnsiblePlaybooksService {
  // @ngInject
  constructor($http, HttpUtils, ENV) {
    this.$http = $http;
    this.HttpUtils = HttpUtils;
    this.ENV = ENV;
  }

  get endpoint() {
    return `${this.ENV.apiEndpoint}api/ansible-playbooks/`;
  }

  get(uuid) {
    return this.$http.get(`${this.endpoint}${uuid}/`).then(response => response.data);
  }

  getAll() {
    return this.HttpUtils.getAll(this.endpoint);
  }
}
