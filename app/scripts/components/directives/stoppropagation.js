// @ngInject
export default function stopPropagation() {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      element.bind('click', function(event) {
        event.stopPropagation();
      });
    }
  };
}
