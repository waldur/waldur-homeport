'use strict';

(function() {
  angular.module('ncsaas')
    .directive('checkQuotas', ['currentStateService', '$compile', detailsView]);

  function detailsView(currentStateService, $compile) {
    return {
      restrict: 'A',
      replace: true,
      scope: {
        checkQuotas: '@',
        showMessage: '=',
        tooltipType: '@'
      },
      link: function(scope, element) {
        // checkQuotas - quota type: resource, project, service, user
        // tooltipType: listItems, emptyListItems, addUser
        // showMessage: boolean
        var item = scope.checkQuotas,
          tooltipType = scope.tooltipType,
          triangleBefore,
          triangleAfter,
          tooltipStyle = '',
          plansLink;

        currentStateService.getCustomer().then(function(response) {

          plansLink = 'organizations.plans({uuid:\''+ response.uuid +'\'})';

          triangleBefore = Math.floor(element[0].parentElement.offsetWidth / 2)+1;
          triangleAfter = triangleBefore + 1;
          triangleBefore = 'style="right: '+ triangleBefore.toString() +'px;"';
          triangleAfter = 'style="right: '+ triangleAfter.toString() +'px;"';

          if (tooltipType == 'addUser') {
            triangleBefore = 'style="left: 20px;"';
            triangleAfter = 'style="left: 21px;"';
            tooltipStyle = 'style="top:115%; left:0; width:350px"';
          }

          var template = '<div '+ tooltipStyle +' stoppropagation class="tooltip quota-tooltip" ng-show="showMessage">' +
            '<div '+ triangleBefore +' class="triangle-before"></div>' +
            '<div '+ triangleAfter +' class="triangle-after"></div>' +
            '<div class="tooltip-title">' +
            '<div class="close" ng-click="showMessage = false;"></div>' +
            '<div class="clear"></div>' +
            '</div>' +
            '<div class="tooltip-text">You have exceeded maximum number of quotas. To update current plan visit ' +
            '<a ui-sref="'+ plansLink +'">plans page</a></div>' +
            '</div>';
          var linkFn = $compile(template);
          var content = linkFn(scope);

          for (var i=0;i<response.quotas.length; i++) {
            var value = response.quotas[i];
            value.name = value.name.replace(/nc_|_count/gi,'');
            if (item && value.name == item && value.limit > -1
              && (value.limit == value.usage || value.limit == 0) /*&& showMessage*/) {
              element.bind('click', function(e) {
                e.stopPropagation();
              });
              scope.showMessage = false;
              element.removeAttr('href');
              element.addClass('disabled-view');
              element.after(content);
              break;
            }
          }
        });
      }
    };
  }
})();
