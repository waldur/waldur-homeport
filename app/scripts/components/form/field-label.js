export default function fieldLabel() {
  return {
    restrict: 'E',
    template: '{{ field.label | translate }} <span class="text-danger">{{ field.required && "*" || "" }}</span>',
    scope: {
      field: '='
    }
  };
}
