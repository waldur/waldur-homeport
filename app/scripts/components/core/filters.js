function filesize() {
  const units = ['MB', 'GB', 'TB', 'PB'];

  return function(input) {
    if (isNaN(parseFloat(input)) || ! isFinite(input)) {
      return '?';
    }

    if (input === -1) {
      return '∞';
    }

    if (input === 0) {
      return input;
    }

    let unit = 0;

    while (input >= 1024) {
      input /= 1024;
      unit++;
    }

    return Math.floor(input * 10) / 10 + ' ' + units[unit];
  };
}

function trustAsHtml($sce) {
  return function(value) {
    return $sce.trustAsHtml(value);
  };
}


function minutesToHours() {
  return function(input) {
    if (isNaN(parseInt(input)) || ! isFinite(input)) {
      return '?';
    }

    if (input === -1) {
      return '∞';
    }

    const hours = input / 60;
    return hours.toFixed(2) + ' H';
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
    if (value === undefined || value.indexOf && value.indexOf(ENV.currency) !== -1) {
      return value;
    }
    let fractionSize = 2;
    if (value != 0 && value < 0.01) {
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

// @ngInject
function decodeHtml($sce) {
  return function(value) {
    return $sce.trustAsHtml(angular.element('<span>').html(value).text());
  };
}

export default module => {
  module.filter('trustAsHtml', trustAsHtml);
  module.filter('decodeHtml', decodeHtml);
  module.filter('filesize', filesize);
  module.filter('titleCase', titleCase);
  module.filter('snakeCase', snakeCase);
  module.filter('replace', replace);
  module.filter('defaultCurrency', defaultCurrency);
  module.filter('shortDate', shortDate);
  module.filter('dateTime', dateTime);
  module.filter('minutesToHours', minutesToHours);
};
