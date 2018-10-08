// @ngInject
export default function appstoreSummary($filter, $compile, $parse) {
  return {
    restrict: 'E',
    link: function(scope, element, attributes) {
      const name = $parse(attributes.component)(scope);
      if (!name) {
        return;
      }
      const component = $filter('snakeCase')(name);
      const template = `<${component} model="${attributes.model}"></${component}>`;
      element.html(template);
      $compile(element.contents())(scope);
    }
  };
}
