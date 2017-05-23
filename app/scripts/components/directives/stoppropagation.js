// @ngInject
export default function stopPropagation() {
  return {
    restrict: 'A',
    link: function(scope, element) {
      element.bind('click', function(event) {
        event.stopPropagation();
      });
    }
  };
}
