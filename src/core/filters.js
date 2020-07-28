import { formatFilesize, dateTime } from './utils';

// @ngInject
function defaultCurrency(ENV, $filter) {
  return function (value) {
    if (
      value === undefined ||
      value === null ||
      (value.indexOf && value.indexOf(ENV.currency) !== -1)
    ) {
      return value;
    }
    let fractionSize = 2;
    if (value !== 0 && Math.abs(value) < 0.01) {
      fractionSize = 3;
    }
    if (value !== 0 && Math.abs(value) < 0.001) {
      fractionSize = 4;
    }
    return $filter('currency')(value, ENV.currency, fractionSize);
  };
}

export default (module) => {
  module.filter('filesize', () => formatFilesize);
  module.filter('defaultCurrency', defaultCurrency);
  module.filter('dateTime', () => dateTime);
};
