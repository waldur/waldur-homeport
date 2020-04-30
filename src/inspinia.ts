/**
 * INSPINIA - Responsive Admin Theme
 * 2.6
 *
 * Custom scripts
 */

// Minimalize menu when screen is less than 768px
function updateSidebar() {
  if (document.body.clientWidth < 769) {
    document.body.classList.add('body-small');
  } else {
    document.body.classList.remove('body-small');
    document.body.classList.remove('mini-navbar');
  }
}

// Full height of sidebar
function fix_height() {
  const sidebarPanel = document.querySelector<HTMLElement>('.sidebard-panel');
  if (sidebarPanel) {
    const heightWithoutNavbar =
      document.querySelector('body > #wrapper').clientHeight - 61;
    sidebarPanel.style.minHeight = heightWithoutNavbar + 'px';
  }

  const pageWrapper = document.querySelector<HTMLElement>('#page-wrapper');
  const navbar = document.querySelector('nav.navbar-default');
  if (navbar) {
    const navbarHeight = navbar.clientHeight;
    const wrapperHeight = pageWrapper.clientHeight;

    if (navbarHeight > wrapperHeight) {
      pageWrapper.style.minHeight = navbarHeight + 'px';
    }

    if (navbarHeight < wrapperHeight) {
      pageWrapper.style.minHeight = document.body.clientHeight + 'px';
    }

    if (document.body.classList.contains('fixed-nav')) {
      if (navbarHeight > wrapperHeight) {
        pageWrapper.style.minHeight = navbarHeight - 60 + 'px';
      } else {
        pageWrapper.style.minHeight = document.body.clientHeight - 60 + 'px';
      }
    }
  }
}

const ready = callback => {
  if (document.readyState != 'loading') callback();
  else document.addEventListener('DOMContentLoaded', callback);
};

const callback = () => {
  updateSidebar();
  if (!document.body.classList.contains('body-small')) {
    fix_height();
  }
};

export default function loadInspinia() {
  ready(callback);
  window.addEventListener('resize', callback);
  window.addEventListener('scroll', callback);

  setTimeout(function() {
    fix_height();
    updateSidebar();
  });
}
