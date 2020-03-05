// @ngInject
export default function submitButton($q) {
  return {
    restrict: 'A',
    scope: {
      submit: '&submitButton',
    },
    link: function(scope, element) {
      element.bind('click', function() {
        element.addClass('disabled').addClass('button-spinner');
        $q.when(scope.submit()).finally(function() {
          element.removeClass('disabled').removeClass('button-spinner');
        });
      });
    },
  };
}
