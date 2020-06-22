import freeipaAccountCreate from './freeipa-account-create';
import freeipaAccountEdit from './freeipa-account-edit';
import freeipaQuota from './freeipa-quota';
import requireTrue from './require-true';

export default (module) => {
  module.directive('requireTrue', requireTrue);
  module.component('freeipaAccountEdit', freeipaAccountEdit);
  module.component('freeipaAccountCreate', freeipaAccountCreate);
  module.component('freeipaQuota', freeipaQuota);
};
