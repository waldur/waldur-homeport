import './powered-by.scss';
import template from './powered-by.html';

// @ngInject
function poweredByController(ENV) {
  this.poweredByLogo = ENV.poweredByLogo;
}

const poweredBy = {
  template,
  controller: poweredByController
};

export default poweredBy;
