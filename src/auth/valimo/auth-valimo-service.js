import Axios from 'axios';

export default class AuthValimoService {
  // @ngInject
  constructor(ENV) {
    this.ENV = ENV;
  }

  login(phone) {
    return Axios.post(`${this.ENV.apiEndpoint}api/auth-valimo/`, {
      phone,
    }).then(response => response.data);
  }

  getAuthResult(uuid) {
    return Axios.post(`${this.ENV.apiEndpoint}api/auth-valimo/result/`, {
      uuid,
    }).then(response => response.data);
  }
}
