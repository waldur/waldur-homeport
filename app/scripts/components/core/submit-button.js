export default function submitButton() {
  return {
    restrict: 'A',
    scope: {
      submit: '&submitButton'
    },
    link: function(scope, element) {
      element.bind('click', function() {
        click();
      });
      function click() {
        element.addClass('disabled').addClass('button-spinner');
        scope.submit().finally(function() {
          element.removeClass('disabled').removeClass('button-spinner');
        });
      }
    }
  };
}
