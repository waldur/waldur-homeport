import * as React from 'react';

import { ngInjector } from '@waldur/core/services';

export const SidebarToggle = () => {
  React.useEffect(() => {
    return ngInjector.get('$transitions').onStart({}, function() {
      if (
        $('body').hasClass('mini-navbar') &&
        $('body').hasClass('body-small')
      ) {
        $('body').removeClass('mini-navbar');
      }
    });
  }, []);

  const toggleSidebar = React.useCallback(() => {
    $('body').toggleClass('mini-navbar');
    if (
      !$('body').hasClass('mini-navbar') ||
      $('body').hasClass('body-small')
    ) {
      // Hide menu in order to smoothly turn on when maximize menu
      $('#side-menu').hide();
      // For smoothly turn on menu
      setTimeout(function() {
        $('#side-menu').fadeIn(400);
      }, 200);
    } else if ($('body').hasClass('fixed-sidebar')) {
      $('#side-menu').hide();
      setTimeout(function() {
        $('#side-menu').fadeIn(400);
      }, 100);
    } else {
      // Remove all inline style from jquery fadeIn function to reset menu state
      $('#side-menu').removeAttr('style');
    }
  }, []);

  return (
    <a
      className="navbar-minimalize minimalize-styl-2 btn btn-primary btn-outline visible-xs-stable"
      onClick={toggleSidebar}
    >
      <i className="fa fa-bars"></i>
    </a>
  );
};
