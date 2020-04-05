import AppHeader from './AppHeader';
import docsLink from './docs-link';
import externalLinks from './ExternalLinks';
import introButton from './intro-button';
import logoutLink from './logout-link';
import mainSearch from './main-search';
import siteHeader from './site-header';
import supportLink from './support-link';

export default module => {
  module.component('siteHeader', siteHeader);
  module.directive('logoutLink', logoutLink);
  module.directive('supportLink', supportLink);
  module.directive('docsLink', docsLink);
  module.directive('mainSearch', mainSearch);
  module.directive('introButton', introButton);
  module.component('ncHeader', AppHeader);
  module.component('externalLinks', externalLinks);
};
