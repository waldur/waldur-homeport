import './powered-by.scss';
import template from './powered-by.html';

const poweredBy = {
  template,
  controller: function(ENV) {
    // @ngInject
    this.poweredByLogo = ENV.poweredByLogo;
  }
};

export default poweredBy;
