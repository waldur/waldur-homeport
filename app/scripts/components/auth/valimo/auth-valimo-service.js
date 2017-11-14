export default class AuthValimoService {
  // @ngInject
  constructor($http, ENV) {
    this.$http = $http;
    this.ENV = ENV;
  }

  login(phone) {
    return this.$http.post(`${this.ENV.apiEndpoint}api/auth-valimo/`, {phone})
      .then(response => response.data);
  }

  getAuthResult(uuid) {
    return this.$http.post(`${this.ENV.apiEndpoint}api/auth-valimo/result/`, {uuid})
      .then(response => response.data);
  }
}
