// @ngInject
export default function extensionPoint($compile, extensionPointService) {
  return {
    restrict: 'E',
    link: function(scope, element, attributes) {
      const templates = extensionPointService.get(attributes.id);
      if (templates) {
        element.html(templates.join(''));
        $compile(element.contents())(scope);
      }
    }
  };
}
