import keyCreate from './key-create';
import keyList from './key-list';
import keysService from './keys-service';
import './help';

export default module => {
  module.component('keyList', keyList);
  module.component('keyCreate', keyCreate);
  module.service('keysService', keysService);
};
