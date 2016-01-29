(function() {
  angular.module('ncsaas').filter('mb2gb', function() {
    return function(input) {
      if (input < 1024) {
        return input + ' MB';
      }
      return Math.round(input / 1024.0) + ' GB';
    }
  })
})();

(function() {
  angular.module('ncsaas').filter('titleCase', function() {
    return function(input) {
      if (input) {
        return input.charAt(0).toUpperCase() + input.slice(1);
      }
    }
  })
})();

(function() {
  angular.module('ncsaas').filter('defaultCurrency', ['ENV', '$filter', defaultCurrency]);
  function defaultCurrency(ENV, $filter) {
    return function(value) {
      return $filter('currency')(value, ENV.currency);
    }
  }
})();
