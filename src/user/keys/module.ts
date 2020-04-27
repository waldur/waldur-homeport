import appstoreFieldSelectSshKey from './appstore-field-select-ssh-key';
import KeyRemoveDialog from './KeyRemoveDialog';
import keysService from './keys-service';
import './help';

export default module => {
  module.component('appstoreFieldSelectSshKey', appstoreFieldSelectSshKey);
  module.component('keyRemoveDialog', KeyRemoveDialog);
  module.service('keysService', keysService);
};
