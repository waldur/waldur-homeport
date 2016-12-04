// @ngInject
export default function visibleIf(ENV, $parse) {
  return {
    transclude: 'element',
    priority: 599,
    terminal: true,
    restrict: 'A',
    $$tlb: true,
    compile: (element, attrs) => ($scope, element, attrs, ctrl, $transclude) => {
      let visible = true;
      if (!ENV.featuresVisible && attrs.visibleIf) {
        let feature = $parse(attrs.visibleIf)($scope);
        visible = ENV.toBeFeatures.indexOf(feature) === -1;
      }

      if (visible) {
        let childScope = $scope.$new();
        $transclude(childScope, clone => {
          element.after(clone).remove();
        });
      }
    }
  };
}
