'use strict';

(function() {

  angular.module('ncsaas')
    .directive('minimalizeSidebar', minimalizeSidebar);

    minimalizeSidebar.$inject = ['$timeout'];

    function minimalizeSidebar($timeout) {
        return {
            restrict: 'A',
            template: '<a class="navbar-minimalize minimalize-styl-2 btn btn-primary btn-outline" ng-click="minimalize()"><i class="fa fa-bars"></i></a>',
            controller: function ($scope, $element) {
                $scope.minimalize = function () {
                    $("body").toggleClass("mini-navbar");
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
