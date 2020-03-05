export default function helpicon() {
  return {
    restrict: 'E',
    template:
      '<i class="fa fa-question-circle" aria-hidden="true" tooltip-append-to-body="true" tooltip-class="select-workspace-dialog__tooltip--order" uib-tooltip="{{ helpText }}"></i>',
    scope: {
      helpText: '@',
    },
  };
}
