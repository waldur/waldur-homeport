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
          text.addClass('active');
          text.css({
            'position': 'absolute',
            'top': -(text[0].offsetHeight + 4) + 'px',
            'left': '50%',
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