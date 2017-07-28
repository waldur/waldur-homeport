import logoutLink from './logout-link';
import supportLink from './support-link';
import docsLink from './docs-link';
import alertsMenu from './alerts-menu';
import mainSearch from './main-search';
import ncHeader from './nc-header';
import introButton from './intro-button';

export default module => {
  module.directive('logoutLink', logoutLink);
  module.directive('supportLink', supportLink);
  module.directive('docsLink', docsLink);
  module.directive('alertsMenu', alertsMenu);
  module.directive('mainSearch', mainSearch);
  module.directive('introButton', introButton);
  module.component('ncHeader', ncHeader);
};
