(function() {
  angular.module('ncsaas').filter('mb2gb', function() {
    return function(input) {
      if (input < 1024) {
        return input + ' MB';
      }
      return Math.round(input / 1024.0) + ' GB';
    }
  });

  angular.module('ncsaas').filter('titleCase', function() {
    return function(input) {
      if (input) {
        return input.charAt(0).toUpperCase() + input.slice(1);
      }
    }
  });

  angular.module('ncsaas').filter('defaultCurrency', ['ENV', '$filter', defaultCurrency]);
  function defaultCurrency(ENV, $filter) {
    return function(value) {
      if (value.indexOf && value.indexOf(ENV.currency) !== -1) {
        return value;
      }
      return $filter('currency')(value, ENV.currency);
    }
  }

  angular.module('ncsaas').filter('dateTime', function() {
    return function(input) {
      if (input) {
        return moment(input).format('YYYY-MM-DD HH:mm');
      }
    }
  });
})();
