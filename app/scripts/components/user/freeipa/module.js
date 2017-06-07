import freeipaService from './freeipaService';
import freeipaAccountEdit from './freeipa-account-edit';
import freeipaAccountCreate from './freeipa-account-create';
import freeipaAccount from './freeipa-account';

export default module => {
  module.service('freeipaService', freeipaService);
  module.component('freeipaAccountEdit', freeipaAccountEdit);
  module.component('freeipaAccountCreate', freeipaAccountCreate);
  module.component('freeipaAccount', freeipaAccount);
};
