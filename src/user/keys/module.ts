import appstoreFieldSelectSshKey from './appstore-field-select-ssh-key';
import keysService from './keys-service';
import './help';

export default module => {
  module.component('appstoreFieldSelectSshKey', appstoreFieldSelectSshKey);
  module.service('keysService', keysService);
};
