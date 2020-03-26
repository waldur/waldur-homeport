import { formatDate, formatRelative } from './dateUtils';
import {
  formatFilesize,
  formatSnakeCase,
  minutesToHours,
  titleCase,
  dateTime,
} from './utils';

function replace() {
  return function(input, search, replacement) {
    return input.replace(new RegExp(search, 'g'), replacement);
  };
}

// @ngInject
function defaultCurrency(ENV, $filter) {
  return function(value) {
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

function shortDate() {
  return function(input) {
    if (input) {
      return formatDate(input);
    }
  };
}

export default module => {
  module.filter('filesize', () => formatFilesize);
  module.filter('titleCase', () => titleCase);
  module.filter('snakeCase', () => formatSnakeCase);
  module.filter('replace', replace);
  module.filter('defaultCurrency', defaultCurrency);
  module.filter('shortDate', shortDate);
  module.filter('dateTime', () => dateTime);
  module.filter('minutesToHours', () => minutesToHours);
  module.filter('formatRelative', () => formatRelative);
};
