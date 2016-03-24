(function() {

  angular.module('ncsaas')
    .directive('compactTableSorter', [compactTableSorter]);

  function compactTableSorter() {
    return {
      restrict: 'E',
      templateUrl: 'views/directives/compact-table-sorter.html',
      scope: {
        fields: '=',
        orderField: '=',
        reverseOrder: '='
      },
      link: function(scope) {
        scope.options = [];
        angular.forEach(scope.fields, function(field) {
          if (field.notSortable) {
            return;
          }
          scope.options.push({
            title: field.name + ' ascending',
            name: field.propertyName,
            reverse: false
          });
          scope.options.push({
            title: field.name + ' descending',
            name: field.propertyName,
            reverse: true
          });
        });
        scope.orderBy = function(option) {
          scope.orderField = option.name;
          scope.reverseOrder = option.reverse;
        };
      }
    };
  }

})();
