import template from './masked-text.html';

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
      let passwordMarker = '&#8226;';
      this.spanElement = this.$element.find('span');

      this.maskedInput = this.input.split('').map(() => { return passwordMarker; }).join('');
      this.spanElement.append(this.maskedInput);
    }

    toggle() {
      this.showSecret = !this.showSecret;
      this.spanElement.empty();
      if (this.showSecret) {
        this.spanElement.append(this.input);
      } else {
        this.spanElement.append(this.maskedInput);
      }
    }
  }
};
