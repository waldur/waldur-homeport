import keyCreate from './key-create';
import keyList from './key-list';
import keysService from './keys-service';
import appstoreFieldSelectSshKey from './appstore-field-select-ssh-key';
import './help';

export default module => {
  module.component('keyList', keyList);
  module.component('keyCreate', keyCreate);
  module.component('appstoreFieldSelectSshKey', appstoreFieldSelectSshKey);
  module.service('keysService', keysService);
};
