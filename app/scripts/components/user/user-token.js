import template from './user-token.html';

export default {
  template,
  bindings: {
    token: '<'
  },
  controller: class maskedTextController {
    $onInit() {
      const passwordMarker = '&bull;';
      this.maskedToken = this.token.split('').map(() =>  passwordMarker).join('');
    }
  }
};
