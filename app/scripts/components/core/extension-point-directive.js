export default function extensionPoint($compile, extensionPointService) {
  return {
    restrict: 'E',
    link: function(scope, element, attributes) {
      const template = extensionPointService.get(attributes.id);
      if (template) {
        element.html(template);
        $compile(element.contents())(scope);
      }
    }
  };
};
