import AppHeader from './AppHeader';
import introButton from './intro-button';
import mainSearch from './main-search';
import siteHeader from './site-header';
import supportLink from './support-link';

export default module => {
  module.component('siteHeader', siteHeader);
  module.directive('supportLink', supportLink);
  module.directive('mainSearch', mainSearch);
  module.directive('introButton', introButton);
  module.component('ncHeader', AppHeader);
};
