'use strict';

(function() {

  angular.module('ncsaas')
  .directive('sidebarToggle', sidebarToggle);

  sidebarToggle.$inject = ['$timeout', '$rootScope'];

  function sidebarToggle($timeout, $rootScope) {
    return {
      restrict: 'E',
      template: '<a class="navbar-minimalize minimalize-styl-2 btn btn-primary btn-outline visible-xs" ng-click="toggleSidebar()"><i class="fa fa-bars"></i></a>',
      controller: function ($scope, $element) {
        $rootScope.$on('$stateChangeStart', function() {
          if ($('body').hasClass('mini-navbar') && $('body').hasClass('body-small')) {
            $('body').removeClass('mini-navbar');
          }
        });
        $scope.toggleSidebar = function () {
          $('body').toggleClass('mini-navbar');
          if (!$('body').hasClass('mini-navbar') || $('body').hasClass('body-small')) {
            // Hide menu in order to smoothly turn on when maximize menu
            $('#side-menu').hide();
            // For smoothly turn on menu
            setTimeout(
              function () {
                $('#side-menu').fadeIn(400);
              }, 200);
          } else if ($('body').hasClass('fixed-sidebar')){
            $('#side-menu').hide();
            setTimeout(
              function () {
                $('#side-menu').fadeIn(400);
              }, 100);
          } else {
            // Remove all inline style from jquery fadeIn function to reset menu state
            $('#side-menu').removeAttr('style');
          }
        }
      }
    };
  }

})();
