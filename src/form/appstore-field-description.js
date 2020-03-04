export default function appstoreFieldDescription() {
  return {
    restrict: 'E',
    template:
      '<p class="form-control-static" ng-bind-html="::field.description"></p>',
    scope: {
      field: '=',
    },
  };
}
