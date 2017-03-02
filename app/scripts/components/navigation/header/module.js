import logoutLink from './logout-link';
import supportLink from './support-link';
import notificationsMenu from './notifications-menu';
import languageSelector from './language-selector';
import mainSearch from './main-search';
import ncHeader from './nc-header';

export default module => {
  module.directive('logoutLink', logoutLink);
  module.directive('supportLink', supportLink);
  module.directive('notificationsMenu', notificationsMenu);
  module.directive('languageSelector', languageSelector);
  module.directive('mainSearch', mainSearch);
  module.component('ncHeader', ncHeader);
}
