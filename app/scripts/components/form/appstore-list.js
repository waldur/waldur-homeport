// @ngInject
export default function appstoreList($filter, $compile, $parse) {
  return {
    restrict: 'E',
    link: function(scope, element, attributes) {
      let component = $parse(attributes.component)(scope);
      component = $filter('snakeCase')(component);
      const template = `
<${component} choices="${attributes.choices}"
              value="${attributes.value}"
              on-change="${attributes.onChange}">
</${component}>`;
      element.html(template);
      $compile(element.contents())(scope);
    }
  }
}
