// @ngInject
export default function visibleIf(ENV, $parse) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      if (ENV.featuresVisible || !attrs.visibleIf) {
        return;
      }
      var feature = $parse(attrs.visibleIf)(scope);
      if (ENV.toBeFeatures.indexOf(feature) !== -1) {
        element.remove();
      }
    }
  };
}
