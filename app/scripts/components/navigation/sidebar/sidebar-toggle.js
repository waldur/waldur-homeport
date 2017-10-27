import template from './sidebar-toggle.html';

// TODO: Drop jQuery
export default {
  template: template,
  controller: class SidebarToggleController {
    // @ngInject
    constructor($rootScope) {
      this.$rootScope = $rootScope;
    }

    $onInit() {
      this.unlisten = this.$rootScope.$on('$stateChangeStart', function() {
        if ($('body').hasClass('mini-navbar') && $('body').hasClass('body-small')) {
          $('body').removeClass('mini-navbar');
        }
      });
    }

    $onDestroy() {
      this.unlisten();
    }

    toggleSidebar() {
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
