import keyCreate from './KeyCreateForm';
import keysList from './KeysList';
import keysService from './keys-service';
import appstoreFieldSelectSshKey from './appstore-field-select-ssh-key';
import './help';
import KeyRemoveDialog from './KeyRemoveDialog';

export default module => {
  module.component('keyList', keysList);
  module.component('keyCreate', keyCreate);
  module.component('appstoreFieldSelectSshKey', appstoreFieldSelectSshKey);
  module.component('keyRemoveDialog', KeyRemoveDialog);
  module.service('keysService', keysService);
};
