// @ngInject
export default function visibleIf(features) {
  /*
    Usage examples:
    <div visible-if="item.feature"></div>
    <div visible-if="'alerts'"></div>

    This directive is compatible with directives which use transclusion, for example ui-tab.
    Also it allows to use scope variable, for example in sidebar directive.
    Note that this directive implements one-time binding,
    so ensure that value of variable does not change.

    This directive mimics behavior of ngIf directive, but doesn't try to circumvent it
    That's why it uses transclude, terminal and $$tlb options.
    ngIf directive has priority 600, so we need priority 599.
  */
  return {
    transclude: 'element',
    priority: 599,
    terminal: true,
    restrict: 'A',
    $$tlb: true,
    link: ($scope, element, attrs, ctrl, $transclude) => {
      const unbind = $scope.$watch(attrs.visibleIf, value => {
        if (features.isVisible(value)) {
          $transclude(clone => element.after(clone).remove());
        }
        unbind();
      });
    },
  };
}
