export default function appstoreFieldLabel() {
  return {
    restrict: 'E',
    template: '<p class="form-control-static"><strong>{{ ::field.label }}</strong></p>',
    scope: {
      field: '=',
    }
  };
}
