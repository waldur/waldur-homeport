import keyCreate from './key-create';
import keyList from './key-list';
import keysService from './keys-service';

export default module => {
  module.directive('keyList', keyList);
  module.directive('keyCreate', keyCreate);
  module.service('keysService', keysService);
};
