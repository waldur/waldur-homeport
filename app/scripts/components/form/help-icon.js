export default function helpicon() {
  return {
    restrict: 'E',
    template: '<i class="fa fa-question-circle" aria-hidden="true" uib-tooltip="{{ helpText }}"></i>',
    scope: {
      helpText: '@'
    }
  };
}
