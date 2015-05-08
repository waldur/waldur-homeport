'use strict';

(function() {

  angular.module('ncsaas')
    .directive('sortline', [SortLine]);

  function SortLine() {
    return {
      templateUrl: "views/directives/sort-line.html"
    };
  }

})();
