'use strict';

(function() {
  angular.module('ncsaas')
    .directive('helpicon', ['$document', helpicon]);

  function helpicon($document) {
    return {
      restrict: 'E',
      templateUrl: "views/directives/help-icon.html",
      replace: true,
      scope: {
        helpText: '@'
      },
      link: function (scope, element) {
        var trigger = element;
        var text = trigger.find('span');

        trigger.css('position', 'relative');
        trigger.bind('click', function(event){
          if (!text.hasClass('active')) {
            text.addClass('active');
            text.css({
              'position': 'absolute',
              'top': -(text[0].offsetHeight + 4) + 'px',
              'left': '50%',
              'margin-left': -text[0].offsetWidth/2 + 'px'
            })
          } else {
            text.removeClass('active');
          }
          event.stopPropagation();
        });
        $document.bind('click', function() {
          text.removeClass('active');
        })

      }
    };
  }

})();
