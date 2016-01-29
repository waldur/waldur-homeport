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
        text.addClass('help-icon-span');

        trigger.css('position', 'relative');

        function show(event) {
          var topPos = 4,
            leftPos = '50%';
          trigger.hasClass('button-help-icon') && (topPos = 8);
          trigger.hasClass('help-icon-l') && (leftPos = '35%');
          text.addClass('active');
          text.css({
            'position': 'absolute',
            'top': -(text[0].offsetHeight + topPos) + 'px',
            'left': leftPos,
            'margin-left': -text[0].offsetWidth/2 + 'px'
          });
          event.stopPropagation();
        }

        function hide() {
          text.removeClass('active');
        }

        trigger.bind('mouseenter', show);
        trigger.bind('mouseleave', hide);

        trigger.bind('focus', show);
        trigger.bind('blur', hide);
      }
    };
  }

})();