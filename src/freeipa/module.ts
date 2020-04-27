import freeipaAccount from './freeipa-account';
import freeipaAccountCreate from './freeipa-account-create';
import freeipaAccountEdit from './freeipa-account-edit';
import freeipaQuota from './freeipa-quota';
import FreeIPAQuotaService from './freeipa-quota-service';
import freeipaService from './freeipaService';
import requireTrue from './require-true';

export default module => {
  module.directive('requireTrue', requireTrue);
  module.service('freeipaService', freeipaService);
  module.service('FreeIPAQuotaService', FreeIPAQuotaService);
  module.component('freeipaAccountEdit', freeipaAccountEdit);
  module.component('freeipaAccountCreate', freeipaAccountCreate);
  module.component('freeipaAccount', freeipaAccount);
  module.component('freeipaQuota', freeipaQuota);
};
