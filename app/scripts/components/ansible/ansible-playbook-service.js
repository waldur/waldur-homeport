export default class AnsiblePlaybooksService {
  // @ngInject
  constructor(HttpUtils, ENV) {
    this.HttpUtils = HttpUtils;
    this.ENV = ENV;
  }

  get endpoint() {
    return `${this.ENV.apiEndpoint}api/ansible-playbooks`;
  }

  getAll() {
    return this.HttpUtils.getAll(this.endpoint);
  }
}
