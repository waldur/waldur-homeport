function filesize() {
  const units = ['MB', 'GB', 'TB', 'PB'];

  return function(input) {
    if (isNaN(parseFloat(input)) || ! isFinite(input)) {
      return '?';
    }
    let unit = 0;

    while (input >= 1024) {
      input /= 1024;
      unit++;
    }

    return Math.floor(input * 10) / 10 + ' ' + units[unit];
  };
}

function titleCase() {
  return function(input) {
    if (input) {
      return input.charAt(0).toUpperCase() + input.slice(1);
    }
  };
}

function snakeCase() {
  const SNAKE_CASE_REGEXP = /[A-Z]/g;
  const separator = '-';

  return function(input) {
    return input.replace(SNAKE_CASE_REGEXP, function(letter, pos) {
      return (pos ? separator : '') + letter.toLowerCase();
    });
  };
}

function replace() {
  return function(input, search, replacement) {
    return input.replace(new RegExp(search, 'g'), replacement);
  };
}

// @ngInject
function defaultCurrency(ENV, $filter) {
  return function(value) {
    if (!value || value.indexOf && value.indexOf(ENV.currency) !== -1) {
      return value;
    }
    let fractionSize = 2;
    if (value < 0.01) {
      fractionSize = 3;
    }
    return $filter('currency')(value, ENV.currency, fractionSize);
  };
}

function shortDate() {
  return function(input) {
    if (input) {
      return moment(input).format('YYYY-MM-DD');
    }
  };
}

function dateTime() {
  return function(input) {
    if (input) {
      return moment(input).format('YYYY-MM-DD HH:mm');
    }
  };
}

function prettyQuotaName() {
  return function(input) {
    if (input) {
      return input.replace(/nc_|_count/g, '').replace(/_/g, ' ');
    }
  };
}

export default module => {
  module.filter('filesize', filesize);
  module.filter('titleCase', titleCase);
  module.filter('snakeCase', snakeCase);
  module.filter('replace', replace);
  module.filter('defaultCurrency', defaultCurrency);
  module.filter('shortDate', shortDate);
  module.filter('dateTime', dateTime);
  module.filter('prettyQuotaName', prettyQuotaName);
};
