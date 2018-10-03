// @ngInject
export default function resourceTab($filter, $compile, $parse) {
  return {
    restrict: 'E',
    link: function(scope, element, attributes) {
      const tab = $parse(attributes.tab)(scope);
      const component = $filter('snakeCase')(tab.component);
      const template = `<${component} resource="${attributes.resource}" tab="${attributes.tab}"></${component}>`;
      element.html(template);
      $compile(element.contents())(scope);
    }
  };
}
