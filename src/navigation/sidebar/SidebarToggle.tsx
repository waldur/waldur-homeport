import { useCallback, FunctionComponent } from 'react';

export const SidebarToggle: FunctionComponent = () => {
  const toggleSidebar = useCallback(() => {
    const bodyClasses = document.body.classList;
    const sideMenu = document.querySelector<HTMLElement>('#side-menu');
    bodyClasses.toggle('mini-navbar');
    if (
      !bodyClasses.contains('mini-navbar') ||
      bodyClasses.contains('body-small')
    ) {
      sideMenu.style.display = 'block';
    } else if (bodyClasses.contains('fixed-sidebar')) {
      sideMenu.style.display = 'block';
    } else {
      // Remove all inline style from jquery fadeIn function to reset menu state
      sideMenu.removeAttribute('style');
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
