const SNAKE_CASE_REGEXP = /[A-Z]/g;

function snake_case(name) {
  const separator = '-';
  return name.replace(SNAKE_CASE_REGEXP, function(letter, pos) {
    return (pos ? separator : '') + letter.toLowerCase();
  });
}

// @ngInject
export default function appstoreField($compile, $parse) {
  return {
    restrict: 'E',
    link: function(scope, element, attributes) {
      const field = $parse(attributes.field)(scope);
      const component = field.component && snake_case(field.component) || `appstore-field-${field.type}`;
      const template = `<${component} model="${attributes.model}" field="${attributes.field}"></${component}>`;
      element.html(template);
      $compile(element.contents())(scope);
    }
  }
}
