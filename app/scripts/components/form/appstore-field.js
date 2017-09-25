// @ngInject
export default function appstoreField($filter, $compile, $parse) {
  return {
    restrict: 'E',
    link: function(scope, element, attributes) {
      const field = $parse(attributes.field)(scope);
      let fieldType;
      if (field.type) {
        fieldType = field.type.replace('_', '-');
      }

      const component = field.component && $filter('snakeCase')(field.component) || `appstore-field-${fieldType}`;
      const template = `<${component} model="${attributes.model}" field="${attributes.field}" form="${attributes.form}"></${component}>`;
      element.html(template);
      $compile(element.contents())(scope);
    }
  };
}
