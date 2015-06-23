'use strict';

(function() {
  angular.module('ncsaas')
    .directive('helpicon', ['ENV', helpicon]);

  function helpicon(ENV) {
    return {
      restrict: 'E',
      templateUrl: "views/directives/help-icon.html",
      replace: true,
      scope: {
        helpText: '@'
      },
      link: function ($scope, element) {
        var trigger = element;
        var text = trigger.find('span');

        trigger.css('position', 'relative');
        trigger.bind('click', function(){
          if (!text.hasClass('active')) {
            text.addClass('active');
            console.log(text[0].offsetHeight);
            text.css({
              'position': 'absolute',
              'top': -(text[0].offsetHeight + 4) + 'px',
              'left': '50%',
              // 'margin-top': -text[0].offsetHeight/2 + 'px',
              'margin-left': -text[0].offsetWidth/2 + 'px'
            })
          } else {
            text.removeClass('active');
          }
        });
      }
    };
  }

})();
