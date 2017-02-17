import template from './user-token.html';

export default {
  template,
  bindings: {
    input: '<'
  },
  controller: class maskedTextController {
    constructor($element) {
      this.$element = $element;
    }

    $onInit() {
      let passwordMarker = '&bull;';
      this.maskedInput = this.input.split('').map(() => { return passwordMarker; }).join('');
    }
  }
};
