const requireTrue = function() {
  return {
    require: 'ngModel',
    restrict: 'A',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$validators.requireTrue = function(modelValue) {
        return !!modelValue;
      };
    },
  };
};

export default requireTrue;
