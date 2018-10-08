/**
 * INSPINIA - Responsive Admin Theme
 * 2.6
 *
 * Custom scripts
 */

// Minimalize menu when screen is less than 768px
function updateSidebar() {
  if ($(document).width() < 769) {
    $('body').addClass('body-small');
  } else {
    $('body').removeClass('body-small');
    $('body').removeClass('mini-navbar');
  }
}

// Full height of sidebar
function fix_height() {
  let heightWithoutNavbar = $('body > #wrapper').height() - 61;
  $('.sidebard-panel').css('min-height', heightWithoutNavbar + 'px');

  let navbarHeight = $('nav.navbar-default').height();
  let wrapperHeight = $('#page-wrapper').height();

  if(navbarHeight > wrapperHeight){
    $('#page-wrapper').css('min-height', navbarHeight + 'px');
  }

  if(navbarHeight < wrapperHeight){
    $('#page-wrapper').css('min-height', $(window).height()  + 'px');
  }

  if ($('body').hasClass('fixed-nav')) {
    if (navbarHeight > wrapperHeight) {
      $('#page-wrapper').css('min-height', navbarHeight - 60 + 'px');
    } else {
      $('#page-wrapper').css('min-height', $(window).height() - 60 + 'px');
    }
  }
}

export default function loadInspinia() {
  $(window).bind('load resize scroll', function() {
    updateSidebar();
    if(!$('body').hasClass('body-small')) {
      fix_height();
    }
  });

  setTimeout(function(){
    fix_height();
    updateSidebar();
  });
}
