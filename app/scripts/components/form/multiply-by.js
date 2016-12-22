export default function multiplyBy() {
  return {
    restrict: 'A',
    require: 'ngModel',
    scope: {
      multiplyBy: '='
    },
    link: function(scope, element, attrs, ngModelController) {
      if (scope.multiplyBy) {
        const factor = parseInt(scope.multiplyBy);
        ngModelController.$parsers.unshift(x => x * factor);
        ngModelController.$formatters.unshift(x => Math.round(x / factor));
      }
    }
  };
}
