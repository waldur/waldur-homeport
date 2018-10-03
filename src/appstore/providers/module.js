import AppstoreProvidersService from './appstore-providers-service';
import appstoreProviders from './appstore-providers';
import appstoreProvidersEmptyMessage from './appstore-providers-empty-message';

export default module => {
  module.service('AppstoreProvidersService', AppstoreProvidersService);
  module.component('appstoreProviders', appstoreProviders);
  module.component('appstoreProvidersEmptyMessage', appstoreProvidersEmptyMessage);
};
