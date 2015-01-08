'use strict';

(function() {
  angular.module('ncsaas')
    .config(function($resourceProvider) {
      $resourceProvider.defaults.stripTrailingSlashes = false;
    });
})();
