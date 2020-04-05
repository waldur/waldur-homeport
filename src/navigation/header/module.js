import AppHeader from './AppHeader';
import introButton from './intro-button';
import siteHeader from './site-header';

export default module => {
  module.component('siteHeader', siteHeader);
  module.directive('introButton', introButton);
  module.component('ncHeader', AppHeader);
};
